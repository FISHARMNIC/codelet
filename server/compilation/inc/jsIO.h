#ifndef JS_IO_H
#define JS_IO_H

extern void console_string(char * output);
extern void console_int(int number);
extern void console_double(double number);
extern void console_char(char number);

int printf(const char *format, ...);

#endif