import * as authService from "./auth.service.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/token.utils.js";
export const signUp = async(req, res, next) => {
    try{
        const result = await authService.signUp(req.body);
        res.status(201).json({
            ...result,
            message: "User created successfully"
        });
    }
    catch(error)
    {
        next(error);
    }
}
export const googleSignIn = async (req, res, next) => {
  try {
    const result = await authService.googleSignIn(req.user);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
        secure: true,
      sameSite: "strict",
       path: "/",
    });

    res.status(200).json({
      message: result.message,
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};


export const googleCallback = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.redirect("https://dykstra.in/login");
    }

    const accessToken = generateAccessToken(user);

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    res.redirect(
      `https://dykstra.in/oauth-success?token=${encodeURIComponent(
        accessToken
      )}&user=${encodeURIComponent(JSON.stringify(userData))}`
    );
  } catch (error) {
    next(error);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user, message } =
      await authService.signIn(req.body);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
       path: "/",
    });

    res.status(200).json({
      message,
      accessToken,
      user,
    });

  } catch (error) {
    next(error);
  }
};
export const signOut = async(req,res,next)=>
{
    try{
        const refreshToken = req.cookies.refreshToken;
        await authService.signOut(refreshToken);
        res.clearCookie("refreshToken");
        res.status(200).json({ message: "Logged out successfully" });
    }
    catch(error)
    {
        next(error);
    }
};

export const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    const newAccessToken =
      await authService.handleRefreshToken(refreshToken);

    res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async(req, res, next)=> {
  try{
    const result = await authService.forgotPassword(req.body);
    res.status(200).json(result);
  }
  catch(error)  
  {
    next(error);
  }
}

export const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

