import bcrypt from 'bcrypt';
import crypto from "crypto";
import * as authRepository from './auth.repository.js';
import { generateAccessToken,generateRefreshToken,  verifyRefreshToken,} from "../../utils/token.utils.js";
import { sendPasswordResetEmail } from '../../utils/email.utils.js';

export const signUp = async({name, email, password})=> {
    const existingUser = await authRepository.findUserByEmail(email);

    if(existingUser)
    {
        throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);


    const newUser = await authRepository.createUser(
        name,
        email, 
        hashedPassword
    );

    return {
        message: "User created successfully",
        user: newUser,
    };
};


export const signIn  = async({email,password})=> {
    const user = await authRepository.findUserByEmail(email);

    if(!user)
    {
        throw new Error('Invalid credentials!');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid)
    {
        throw new Error('Invalid credentials!');
    }


    const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await authRepository.storeRefreshToken(user.id, refreshToken);

  return {
   message: "Login successful",
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
};


export const googleSignIn = async (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await authRepository.storeRefreshToken(user.id, refreshToken);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
};

export const signOut = async (refreshToken) => {
  await authRepository.deleteRefreshToken(refreshToken);
};



export const handleRefreshToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error("No refresh token provided");
  }

  let decoded;

  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw new Error("Invalid or expired refresh token");
  }

  const storedToken =
    await authRepository.findRefreshToken(refreshToken);

  if (!storedToken) {
    throw new Error("Refresh token not found in DB");
  }

  const user = await authRepository.findUserById(decoded.id);

  return generateAccessToken(user);
};


export const forgotPassword = async ({ email }) => {
  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    throw new Error("User with this email does not exist");
  }

  // Invalidate any previous reset links
  await authRepository.deletePasswordResetTokensByUserId(user.id);

  const resetToken = crypto.randomBytes(32).toString("hex");

  const expiresAt = new Date(
    Date.now() + 15 * 60 * 1000
  );

  await authRepository.storePasswordResetToken(
    user.id,
    resetToken,
    expiresAt
  );

  await sendPasswordResetEmail(email, resetToken);

  return {
    message: "Password reset email sent successfully",
  };
};


export const resetPassword = async ({ resetToken, newPassword }) => {
  console.log("TOKEN RECEIVED:", resetToken);

  const record =
    await authRepository.findPasswordResetToken(resetToken);

  console.log("DB RECORD:", record);

  if (record) {
    console.log("EXPIRES AT:", record.expires_at);
    console.log("CURRENT TIME:", new Date());
    console.log(
      "EXPIRED:",
      new Date(record.expires_at) < new Date()
    );
  }

  if (!record || new Date(record.expires_at) < new Date()) {
    throw new Error("Invalid or expired reset token");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await authRepository.updateUserPassword(
    record.user_id,
    hashedPassword
  );

  await authRepository.deletePasswordResetToken(resetToken);

  return {
    message: "Password reset successfully",
  };
};