#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#define MAX_LINE 1024
#define MAX_EXPR 256

int line_num = 100;
int temp_num = 1;
FILE *out;

char *trim(char *s)
{
    while (isspace(*s))
        s++;
    char *end = s + strlen(s) - 1;
    while (end > s && isspace(*end))
        *end-- = '\0';
    return s;
}

int is_operator(char c)
{
    return c == '+' || c == '-' || c == '*' || c == '/' || c == '%';
}

int precedence(char op)
{
    if (op == '*' || op == '/' || op == '%')
        return 2;
    if (op == '+' || op == '-')
        return 1;
    return 0;
}

// Generate TAC for arithmetic expression, return temp variable name
char *gen_expr(char *expr, char *result)
{
    expr = trim(expr);

    // Find lowest precedence operator outside parentheses
    int paren = 0, pos = -1, min_prec = 999;
    for (int i = strlen(expr) - 1; i >= 0; i--)
    {
        if (expr[i] == ')')
            paren++;
        else if (expr[i] == '(')
            paren--;
        else if (paren == 0 && is_operator(expr[i]) && i > 0 && !is_operator(expr[i - 1]))
        {
            int p = precedence(expr[i]);
            if (p <= min_prec)
            {
                min_prec = p;
                pos = i;
            }
        }
    }

    if (pos > 0)
    {
        char left[MAX_EXPR], right[MAX_EXPR];
        strncpy(left, expr, pos);
        left[pos] = '\0';
        strcpy(right, expr + pos + 1);

        char left_res[32], right_res[32];
        gen_expr(trim(left), left_res);
        gen_expr(trim(right), right_res);

        sprintf(result, "t%d", temp_num++);
        fprintf(out, "%d: %s = %s %c %s\n", line_num++, result, left_res, expr[pos], right_res);
        return result;
    }

    // Handle parentheses
    if (expr[0] == '(' && expr[strlen(expr) - 1] == ')')
    {
        expr[strlen(expr) - 1] = '\0';
        return gen_expr(expr + 1, result);
    }

    // Base case: number or variable
    strcpy(result, expr);
    return result;
}

// Handle relational operators, return label to jump to
void gen_condition(char *cond, int true_label, int false_label)
{
    cond = trim(cond);

    // Check for || (lowest precedence)
    int paren = 0;
    for (int i = 0; i < (int)strlen(cond) - 1; i++)
    {
        if (cond[i] == '(')
            paren++;
        else if (cond[i] == ')')
            paren--;
        else if (paren == 0 && cond[i] == '|' && cond[i + 1] == '|')
        {
            char left[MAX_EXPR], right[MAX_EXPR];
            strncpy(left, cond, i);
            left[i] = '\0';
            strcpy(right, cond + i + 2);

            int mid_label = line_num + 10; // estimate
            gen_condition(trim(left), true_label, line_num + 2);
            gen_condition(trim(right), true_label, false_label);
            return;
        }
    }

    // Check for &&
    paren = 0;
    for (int i = 0; i < (int)strlen(cond) - 1; i++)
    {
        if (cond[i] == '(')
            paren++;
        else if (cond[i] == ')')
            paren--;
        else if (paren == 0 && cond[i] == '&' && cond[i + 1] == '&')
        {
            char left[MAX_EXPR], right[MAX_EXPR];
            strncpy(left, cond, i);
            left[i] = '\0';
            strcpy(right, cond + i + 2);

            gen_condition(trim(left), line_num + 2, false_label);
            gen_condition(trim(right), true_label, false_label);
            return;
        }
    }

    // Check for !
    if (cond[0] == '!')
    {
        if (cond[1] == '(')
        {
            cond[strlen(cond) - 1] = '\0';
            gen_condition(cond + 2, false_label, true_label);
        }
        else
        {
            gen_condition(cond + 1, false_label, true_label);
        }
        return;
    }

    // Handle parentheses
    if (cond[0] == '(' && cond[strlen(cond) - 1] == ')')
    {
        cond[strlen(cond) - 1] = '\0';
        gen_condition(cond + 1, true_label, false_label);
        return;
    }

    // Find relational operator
    char *ops[] = {"==", "!=", "<=", ">=", "<", ">"};
    for (int i = 0; i < 6; i++)
    {
        char *p = strstr(cond, ops[i]);
        if (p)
        {
            char left[MAX_EXPR], right[MAX_EXPR], left_res[32], right_res[32];
            int len = strlen(ops[i]);
            strncpy(left, cond, p - cond);
            left[p - cond] = '\0';
            strcpy(right, p + len);

            gen_expr(trim(left), left_res);
            gen_expr(trim(right), right_res);

            fprintf(out, "%d: if %s %s %s goto %d\n", line_num++, left_res, ops[i], right_res, true_label);
            fprintf(out, "%d: goto %d\n", line_num++, false_label);
            return;
        }
    }

    // Simple variable as condition (non-zero check)
    char res[32];
    gen_expr(cond, res);
    fprintf(out, "%d: if %s != 0 goto %d\n", line_num++, res, true_label);
    fprintf(out, "%d: goto %d\n", line_num++, false_label);
}

void process_assignment(char *line)
{
    char *eq = strchr(line, '=');
    if (!eq)
        return;

    // Check for compound operators
    char var[64], expr_str[MAX_EXPR];
    if (*(eq - 1) == '+' || *(eq - 1) == '-' || *(eq - 1) == '*' || *(eq - 1) == '/')
    {
        char op = *(eq - 1);
        strncpy(var, line, eq - line - 1);
        var[eq - line - 1] = '\0';
        strcpy(expr_str, eq + 1);

        char result[32];
        gen_expr(trim(expr_str), result);

        char temp[32];
        sprintf(temp, "t%d", temp_num++);
        fprintf(out, "%d: %s = %s %c %s\n", line_num++, temp, trim(var), op, result);
        fprintf(out, "%d: %s = %s\n", line_num++, trim(var), temp);
    }
    else if (*(eq + 1) == '=')
    {
        // == comparison, not assignment
        return;
    }
    else
    {
        strncpy(var, line, eq - line);
        var[eq - line] = '\0';
        strcpy(expr_str, eq + 1);

        char *semi = strchr(expr_str, ';');
        if (semi)
            *semi = '\0';

        char result[32];
        char *trimmed = trim(expr_str);

        // Check if simple value or needs expression evaluation
        int needs_temp = 0;
        for (int i = 0; trimmed[i]; i++)
        {
            if (is_operator(trimmed[i]) && i > 0)
            {
                needs_temp = 1;
                break;
            }
        }

        if (needs_temp)
        {
            gen_expr(trimmed, result);
            fprintf(out, "%d: %s = %s\n", line_num++, trim(var), result);
        }
        else
        {
            fprintf(out, "%d: %s = %s\n", line_num++, trim(var), trimmed);
        }
    }
}

void process_line(char *line);

// Extract condition from parentheses
char* get_cond(char *line, char *cond) {
    char *s = strchr(line, '(');
    if (!s) return NULL;
    int p = 1, i = 1;
    while (p > 0 && s[i]) {
        if (s[i] == '(') p++;
        else if (s[i] == ')') p--;
        i++;
    }
    strncpy(cond, s + 1, i - 2);
    cond[i - 2] = '\0';
    return s + i;
}

void process_if(char *line)
{
    char *start = strchr(line, '(');
    if (!start)
        return;

    // Find matching closing paren
    int paren = 1, i = 1;
    while (paren > 0 && start[i])
    {
        if (start[i] == '(')
            paren++;
        else if (start[i] == ')')
            paren--;
        i++;
    }

    char cond[MAX_EXPR];
    strncpy(cond, start + 1, i - 2);
    cond[i - 2] = '\0';

    char *body = start + i;
    while (isspace(*body))
        body++;

    // Save current line_num for backpatching
    int saved = line_num;

    // Estimate where body ends
    char *body_end = strchr(body, ';');
    int body_lines = 1;
    if (body_end)
    {
        char body_copy[MAX_EXPR];
        strncpy(body_copy, body, body_end - body + 1);
        body_copy[body_end - body + 1] = '\0';
        // Count operations in body
        for (char *p = body_copy; *p; p++)
        {
            if (*p == '+' || *p == '-' || *p == '*' || *p == '/')
                body_lines++;
        }
    }

    int true_label = saved + 2;
    int false_label = saved + 2 + body_lines + 1;

    gen_condition(cond, true_label, false_label);

    // Process body
    if (body_end)
    {
        char body_stmt[MAX_EXPR];
        strncpy(body_stmt, body, body_end - body);
        body_stmt[body_end - body] = '\0';
        process_line(body_stmt);
    }
}

void process_line(char *line)
{
    line = trim(line);
    if (!line[0] || line[0] == '#' || line[0] == '/' || line[0] == '{' || line[0] == '}')
        return;
    if (strncmp(line, "int main", 8) == 0 || strncmp(line, "void main", 9) == 0)
        return;
    if (strncmp(line, "return", 6) == 0)
    {
        fprintf(out, "%d: return\n", line_num++);
        return;
    }

    // Skip type declarations but process initializations
    char *types[] = {"int ", "float ", "double ", "char ", "long "};
    for (int i = 0; i < 5; i++)
    {
        if (strncmp(line, types[i], strlen(types[i])) == 0)
        {
            line += strlen(types[i]);
            break;
        }
    }

    if (strncmp(line, "if", 2) == 0 && (line[2] == ' ' || line[2] == '('))
    {
        process_if(line);
        return;
    }

    // while loop: while(cond) body => L1: if cond goto L2; goto L3; L2: body; goto L1; L3:
    if (strncmp(line, "while", 5) == 0 && (line[5] == ' ' || line[5] == '('))
    {
        char cond[MAX_EXPR];
        char *body = get_cond(line, cond);
        if (!body) return;
        
        int loop_start = line_num;
        int body_label = loop_start + 2;
        int end_label = body_label + 3;
        
        gen_condition(cond, body_label, end_label);
        
        while (isspace(*body)) body++;
        if (*body && *body != '{') {
            char *semi = strchr(body, ';');
            if (semi) {
                char stmt[MAX_EXPR];
                strncpy(stmt, body, semi - body);
                stmt[semi - body] = '\0';
                process_line(stmt);
            }
        }
        fprintf(out, "%d: goto %d\n", line_num++, loop_start);
        return;
    }

    // for loop: for(init; cond; incr) body
    if (strncmp(line, "for", 3) == 0 && (line[3] == ' ' || line[3] == '('))
    {
        char *s = strchr(line, '(');
        if (!s) return;
        
        char init[MAX_EXPR] = "", cond[MAX_EXPR] = "", incr[MAX_EXPR] = "";
        int paren = 1, part = 0, j = 0;
        
        for (int i = 1; s[i] && paren > 0; i++) {
            if (s[i] == '(') paren++;
            else if (s[i] == ')') { paren--; if (paren == 0) break; }
            else if (s[i] == ';' && paren == 1) {
                if (part == 0) init[j] = '\0';
                else if (part == 1) cond[j] = '\0';
                part++; j = 0; continue;
            }
            if (part == 0) init[j++] = s[i];
            else if (part == 1) cond[j++] = s[i];
            else incr[j++] = s[i];
        }
        incr[j] = '\0';
        
        // Process init
        if (strlen(trim(init)) > 0) process_line(init);
        
        int loop_start = line_num;
        int body_label = loop_start + 2;
        int end_label = body_label + 5;
        
        // Process condition
        if (strlen(trim(cond)) > 0) gen_condition(cond, body_label, end_label);
        
        // Find body
        char *body = s;
        while (*body && *body != ')') body++;
        body++;
        while (isspace(*body)) body++;
        
        if (*body && *body != '{') {
            char *semi = strchr(body, ';');
            if (semi) {
                char stmt[MAX_EXPR];
                strncpy(stmt, body, semi - body);
                stmt[semi - body] = '\0';
                process_line(stmt);
            }
        }
        
        // Process increment
        if (strlen(trim(incr)) > 0) process_line(incr);
        
        fprintf(out, "%d: goto %d\n", line_num++, loop_start);
        return;
    }

    // Handle increment/decrement
    char *pp = strstr(line, "++");
    if (pp)
    {
        char var[64];
        if (pp == line)
        {
            strcpy(var, pp + 2);
        }
        else
        {
            strncpy(var, line, pp - line);
            var[pp - line] = '\0';
        }
        char *semi = strchr(var, ';');
        if (semi)
            *semi = '\0';
        char temp[32];
        sprintf(temp, "t%d", temp_num++);
        fprintf(out, "%d: %s = %s + 1\n", line_num++, temp, trim(var));
        fprintf(out, "%d: %s = %s\n", line_num++, trim(var), temp);
        return;
    }

    char *mm = strstr(line, "--");
    if (mm)
    {
        char var[64];
        strncpy(var, line, mm - line);
        var[mm - line] = '\0';
        char *semi = strchr(var, ';');
        if (semi)
            *semi = '\0';
        char temp[32];
        sprintf(temp, "t%d", temp_num++);
        fprintf(out, "%d: %s = %s - 1\n", line_num++, temp, trim(var));
        fprintf(out, "%d: %s = %s\n", line_num++, trim(var), temp);
        return;
    }

    if (strchr(line, '='))
    {
        process_assignment(line);
    }
}

int main(int argc, char *argv[])
{
    if (argc != 3)
    {
        printf("Usage: %s <input.c> <output.txt>\n", argv[0]);
        return 1;
    }

    FILE *in = fopen(argv[1], "r");
    if (!in)
    {
        printf("Cannot open input file\n");
        return 1;
    }

    out = fopen(argv[2], "w");
    if (!out)
    {
        fclose(in);
        printf("Cannot open output file\n");
        return 1;
    }

    char line[MAX_LINE];
    char multiline[MAX_LINE * 4] = "";

    while (fgets(line, MAX_LINE, in))
    {
        // Handle multi-line statements
        char *trimmed = trim(line);
        strcat(multiline, " ");
        strcat(multiline, trimmed);

        if (strchr(trimmed, ';') || strchr(trimmed, '{') || strchr(trimmed, '}') ||
            trimmed[0] == '#' || strlen(trimmed) == 0)
        {
            // Process complete statement(s)
            char *stmt = multiline;
            char *semi;
            while ((semi = strchr(stmt, ';')) != NULL || strchr(stmt, '}'))
            {
                char single[MAX_LINE];
                char *end = strchr(stmt, ';');
                char *brace = strchr(stmt, '}');
                if (brace && (!end || brace < end))
                    end = brace;
                if (!end)
                    break;

                strncpy(single, stmt, end - stmt + 1);
                single[end - stmt + 1] = '\0';
                process_line(single);
                stmt = end + 1;
            }
            multiline[0] = '\0';
        }
    }

    fclose(in);
    fclose(out);
    printf("TAC generated in %s\n", argv[2]);
    return 0;
}
