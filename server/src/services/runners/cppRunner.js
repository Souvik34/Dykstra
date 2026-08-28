/* =========================================================
   C++ RUNNER
   Supports:
   - int / long long / double / bool / char / string
   - vector<int>
   - vector<long long>
   - vector<double>
   - vector<string>
   - vector<vector<int>>
   - ListNode
   - TreeNode
   ========================================================= */

const generateCppDataStructures = () => `
/* ================= LINKED LIST ================= */

struct ListNode {
    int val;
    ListNode* next;

    ListNode(int x) : val(x), next(nullptr) {}

    ListNode(int x, ListNode* next) : val(x), next(next) {}
};


/* ================= BINARY TREE ================= */

struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;

    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};
`;


/* =========================================================
   PARSERS
   ========================================================= */

const generateCppParsers = () => `

vector<int> parseIntVector(string input) {

    vector<int> result;

    input.erase(
        remove(input.begin(), input.end(), '['),
        input.end()
    );

    input.erase(
        remove(input.begin(), input.end(), ']'),
        input.end()
    );

    input.erase(
        remove(input.begin(), input.end(), ' '),
        input.end()
    );

    if (input.empty()) {
        return result;
    }

    stringstream ss(input);
    string token;

    while (getline(ss, token, ',')) {
        if (!token.empty()) {
            result.push_back(stoi(token));
        }
    }

    return result;
}


vector<long long> parseLongVector(string input) {

    vector<long long> result;

    input.erase(
        remove(input.begin(), input.end(), '['),
        input.end()
    );

    input.erase(
        remove(input.begin(), input.end(), ']'),
        input.end()
    );

    input.erase(
        remove(input.begin(), input.end(), ' '),
        input.end()
    );

    if (input.empty()) {
        return result;
    }

    stringstream ss(input);
    string token;

    while (getline(ss, token, ',')) {
        if (!token.empty()) {
            result.push_back(stoll(token));
        }
    }

    return result;
}


vector<double> parseDoubleVector(string input) {

    vector<double> result;

    input.erase(
        remove(input.begin(), input.end(), '['),
        input.end()
    );

    input.erase(
        remove(input.begin(), input.end(), ']'),
        input.end()
    );

    input.erase(
        remove(input.begin(), input.end(), ' '),
        input.end()
    );

    if (input.empty()) {
        return result;
    }

    stringstream ss(input);
    string token;

    while (getline(ss, token, ',')) {
        if (!token.empty()) {
            result.push_back(stod(token));
        }
    }

    return result;
}


vector<string> parseStringVector(string input) {

    vector<string> result;

    input.erase(
        remove(input.begin(), input.end(), '['),
        input.end()
    );

    input.erase(
        remove(input.begin(), input.end(), ']'),
        input.end()
    );

    input.erase(
        remove(input.begin(), input.end(), '"'),
        input.end()
    );

    input.erase(
        remove(input.begin(), input.end(), '\\\\''),
        input.end()
    );

    stringstream ss(input);
    string token;

    while (getline(ss, token, ',')) {

        token.erase(
            0,
            token.find_first_not_of(" ")
        );

        token.erase(
            token.find_last_not_of(" ") + 1
        );

        if (!token.empty()) {
            result.push_back(token);
        }
    }

    return result;
}


vector<vector<int>> parseIntMatrix(string input) {

    vector<vector<int>> result;

    input.erase(
        remove(input.begin(), input.end(), ' '),
        input.end()
    );

    if (input == "[]" || input.empty()) {
        return result;
    }

    if (
        input.size() >= 2 &&
        input.front() == '[' &&
        input.back() == ']'
    ) {
        input = input.substr(1, input.size() - 2);
    }

    vector<string> rows;

    string current;
    int depth = 0;

    for (char c : input) {

        if (c == '[') {
            depth++;
        }

        if (c == ']') {
            depth--;
        }

        current += c;

        if (c == ']' && depth == 0) {
            rows.push_back(current);
            current.clear();
        }
    }

    for (string row : rows) {

        result.push_back(
            parseIntVector(row)
        );
    }

    return result;
}


/* ================= LINKED LIST ================= */

ListNode* parseListNode(string input) {

    vector<int> values =
        parseIntVector(input);

    if (values.empty()) {
        return nullptr;
    }

    ListNode dummy(0);
    ListNode* current = &dummy;

    for (int value : values) {

        current->next =
            new ListNode(value);

        current =
            current->next;
    }

    return dummy.next;
}


/* ================= TREE ================= */

TreeNode* parseTreeNode(string input) {

    input.erase(
        remove(input.begin(), input.end(), '['),
        input.end()
    );

    input.erase(
        remove(input.begin(), input.end(), ']'),
        input.end()
    );

    input.erase(
        remove(input.begin(), input.end(), ' '),
        input.end()
    );

    if (input.empty()) {
        return nullptr;
    }

    vector<string> values;

    stringstream ss(input);
    string token;

    while (getline(ss, token, ',')) {
        values.push_back(token);
    }

    if (
        values.empty() ||
        values[0] == "null"
    ) {
        return nullptr;
    }

    TreeNode* root =
        new TreeNode(stoi(values[0]));

    queue<TreeNode*> q;

    q.push(root);

    int index = 1;

    while (
        !q.empty() &&
        index < values.size()
    ) {

        TreeNode* node = q.front();
        q.pop();

        if (
            index < values.size() &&
            values[index] != "null"
        ) {

            node->left =
                new TreeNode(
                    stoi(values[index])
                );

            q.push(node->left);
        }

        index++;

        if (
            index < values.size() &&
            values[index] != "null"
        ) {

            node->right =
                new TreeNode(
                    stoi(values[index])
                );

            q.push(node->right);
        }

        index++;
    }

    return root;
}
`;


/* =========================================================
   SERIALIZERS
   ========================================================= */

const generateCppSerializers = () => `

void printResult(bool value) {
    cout << (value ? "true" : "false") << endl;
}


void printResult(int value) {
    cout << value << endl;
}


void printResult(long long value) {
    cout << value << endl;
}


void printResult(double value) {
    cout << value << endl;
}


void printResult(char value) {
    cout << value << endl;
}


void printResult(string value) {
    cout << value << endl;
}


void printResult(vector<int> arr) {

    for (int i = 0; i < arr.size(); i++) {

        if (i > 0) {
            cout << ",";
        }

        cout << arr[i];
    }

    cout << endl;
}


void printResult(vector<long long> arr) {

    for (int i = 0; i < arr.size(); i++) {

        if (i > 0) {
            cout << ",";
        }

        cout << arr[i];
    }

    cout << endl;
}


void printResult(vector<double> arr) {

    for (int i = 0; i < arr.size(); i++) {

        if (i > 0) {
            cout << ",";
        }

        cout << arr[i];
    }

    cout << endl;
}


void printResult(vector<string> arr) {

    for (int i = 0; i < arr.size(); i++) {

        if (i > 0) {
            cout << ",";
        }

        cout << arr[i];
    }

    cout << endl;
}


void printResult(vector<vector<int>> matrix) {

    for (int i = 0; i < matrix.size(); i++) {

        if (i > 0) {
            cout << ";";
        }

        for (int j = 0; j < matrix[i].size(); j++) {

            if (j > 0) {
                cout << ",";
            }

            cout << matrix[i][j];
        }
    }

    cout << endl;
}


void printResult(ListNode* head) {

    bool first = true;

    while (head != nullptr) {

        if (!first) {
            cout << ",";
        }

        cout << head->val;

        first = false;

        head = head->next;
    }

    cout << endl;
}


void printResult(TreeNode* root) {

    if (root == nullptr) {
        cout << endl;
        return;
    }

    queue<TreeNode*> q;

    q.push(root);

    bool first = true;

    while (!q.empty()) {

        TreeNode* node = q.front();
        q.pop();

        if (!first) {
            cout << ",";
        }

        if (node == nullptr) {

            cout << "null";

        } else {

            cout << node->val;

            q.push(node->left);
            q.push(node->right);
        }

        first = false;
    }

    cout << endl;
}
`;


/* =========================================================
   TYPE → PARSER
   ========================================================= */

const getParser = (type, name) => {

    const normalized =
        type.replace(/\s+/g, "");

    if (normalized === "int") {
        return `int ${name}; cin >> ${name};`;
    }

    if (
        normalized === "long" ||
        normalized === "longlong" ||
        normalized === "longlongint"
    ) {
        return `long long ${name}; cin >> ${name};`;
    }

    if (normalized === "double") {
        return `double ${name}; cin >> ${name};`;
    }

    if (normalized === "float") {
        return `float ${name}; cin >> ${name};`;
    }

    if (normalized === "bool") {
        return `bool ${name}; cin >> ${name};`;
    }

    if (normalized === "char") {
        return `char ${name}; cin >> ${name};`;
    }

    if (normalized === "string") {
        return `string ${name}; getline(cin >> ws, ${name});`;
    }

    if (
        normalized === "vector<int>" ||
        normalized === "vector<integer>"
    ) {
        return `
string input_${name};
getline(cin >> ws, input_${name});
vector<int> ${name} =
    parseIntVector(input_${name});
`;
    }

    if (
        normalized === "vector<longlong>"
    ) {
        return `
string input_${name};
getline(cin >> ws, input_${name});
vector<long long> ${name} =
    parseLongVector(input_${name});
`;
    }

    if (normalized === "vector<double>") {
        return `
string input_${name};
getline(cin >> ws, input_${name});
vector<double> ${name} =
    parseDoubleVector(input_${name});
`;
    }

    if (normalized === "vector<string>") {
        return `
string input_${name};
getline(cin >> ws, input_${name});
vector<string> ${name} =
    parseStringVector(input_${name});
`;
    }

    if (
        normalized === "vector<vector<int>>"
    ) {
        return `
string input_${name};
getline(cin >> ws, input_${name});
vector<vector<int>> ${name} =
    parseIntMatrix(input_${name});
`;
    }

    if (
        normalized === "listnode*" ||
        normalized === "listnode"
    ) {
        return `
string input_${name};
getline(cin >> ws, input_${name});
ListNode* ${name} =
    parseListNode(input_${name});
`;
    }

    if (
        normalized === "treenode*" ||
        normalized === "treenode"
    ) {
        return `
string input_${name};
getline(cin >> ws, input_${name});
TreeNode* ${name} =
    parseTreeNode(input_${name});
`;
    }

    /*
     * Fallback.
     *
     * This prevents the generated program from
     * immediately breaking if the AI produces a
     * slightly different type.
     */
    return `
string ${name};
getline(cin >> ws, ${name});
`;
};


/* =========================================================
   MAIN
   ========================================================= */

export const prepareCppCode = ({ code, problem }) => {

    const signature =
        problem?.functionSignature;

    if (!signature) {
        throw new Error(
            "C++ runner: function signature missing"
        );
    }

    console.log("C++ FUNCTION SIGNATURE");
    console.dir(signature, { depth: null });


    const parameters =
        signature.parameters || [];


    /*
     * Generate input parsing.
     */

    const parserCode =
        parameters
            .map((parameter) =>
                getParser(
                    parameter.type,
                    parameter.name
                )
            )
            .join("\n");


    /*
     * Generate function arguments.
     */

    const args =
        parameters
            .map((parameter) =>
                parameter.name
            )
            .join(", ");


    /*
     * Generate function invocation.
     */

    let outputCode;

    if (
        signature.returnType === "void"
    ) {

        outputCode = `
        sol.${signature.name}(${args});
        `;

    } else {

        outputCode = `
        auto result =
            sol.${signature.name}(${args});

        printResult(result);
        `;
    }


    /*
     * IMPORTANT:
     *
     * We ONLY generate C++ here.
     * Java runner is completely untouched.
     */

   const preparedCode = `
#include <bits/stdc++.h>

using namespace std;


/* =========================================================
   DATA STRUCTURES
   ========================================================= */

${generateCppDataStructures()}


/* =========================================================
   USER SOLUTION
   ========================================================= */

${code}


/* =========================================================
   HELPERS
   ========================================================= */

${generateCppParsers()}

${generateCppSerializers()}


/* =========================================================
   MAIN
   ========================================================= */

int main() {

    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    ${parserCode}

    Solution sol;

    ${outputCode}

    return 0;
}
`;

console.log("========== GENERATED C++ ==========");
console.log(preparedCode);
console.log("==================================");

return preparedCode;
};