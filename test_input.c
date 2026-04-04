#include <stdio.h>
int main()
{
    float balance = 1000.50;
    float rate = 0.05;
    int years = 5;
    int is_premium_member = 1;
    int account_active = 1;
    float interest = balance * (1 + rate) *
                         years -
                     balance;
    balance = balance + interest;
    if ((balance > 1200.00 &&
         is_premium_member) ||
        account_active == 1)
    {
        balance += 50.0;
        years++;
    }
    if (!(balance < 500.00) && years != 0)
    {
        balance = balance - 10.0;
    }
    int i = 0;
    while (i < 10)
    {
        i++;
    }
    int sum = 0;
    for (int j = 0; j < 5; j++)
    {
        sum = sum + j;
    }
    return 0;
}
