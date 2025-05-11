#include "wasm.h"

char* p = "Apples\n";

int main()
{
    *p = 'M';
    *(p+1) = 'a';
    console_string(p);
    return 0;
}