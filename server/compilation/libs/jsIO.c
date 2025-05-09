#include "../inc/jsIO.h"
#include <stdarg.h>

int printf(const char *format, ...)
{
    va_list args;
    va_start(args, format);

    int i = 0;
    while (format[i] != '\0')
    {
        if (format[i] == '%')
        {
            i++;
            switch (format[i])
            {
            case 's': {
                char *s = va_arg(args, char *);
                console_string(s);
                break;
            }
            case 'd':
            case 'i': {
                int i = va_arg(args, int);
                console_int(i);
                break;
            }
            case 'f': {
                double f = va_arg(args, double);
                console_double(f);
                break;
            }
            }
        }
        else
        {
            console_char(format[i]);
        }
        i++;
    }

    va_end(args);
    return 0;
}