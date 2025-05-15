# Codelet

C memory visualization tool + debugger.  
  
[Visit it live!](https://codelet-300i.onrender.com/)  
  
*Note: unfortunately, the server may take up to 1 minute to launch if no one has recently used it. Upon launching, you might get a browser error. If such, simply reload the page and it should work. If you don't want this, you can run it locally using the instructions below.*  
<p align="center">
<img width="700" alt="Screen Shot 2025-05-11 at 8 28 07 PM" src="https://github.com/user-attachments/assets/7257c92d-f796-4367-8075-ce12c25d3894" />
<img width="700" alt="Screen Shot 2025-05-11 at 8 23 11 PM" src="https://github.com/user-attachments/assets/c2bef6a0-b9d8-4448-858c-57b89753a3cb" />
</p>

# Currently Working
* Single-stepping
* Shows the parts of memory that changed after each line
* **to-do:**
    * Learning mode with hands on activities
    * UI and speed improvements

# Usage

#### Interface
* The `bolt` button is used to compile and start the program
* The `step` (lowest) button is used to step to the next instruction. Note that this isn't perfect since I essentially run your code through a small preprocessor that tries to insert breakpoints where possible. If you find any bugs please let me know! You can also insert manual breakpoints with `js_break()` (see below).
* The `play` button will cause the program to run normally, without automatic breakpoints. Manual breakpoints using `js_break` still work, and need to be stepped out of using the `step` button. Upon clicking the `play` button, it turns into a `pause` button. If a breakpoint is then encountered, the `pause` button can be clicked to resume step-by-step execution.

#### JS interop functions
* `js_memview(MODE_DUMP or MODE_MAP)`
    * Switches between memory display modes. 
    * `MODE_DUMP` will just display a dump of a large section of memory
    * `MODE_MAP` shows slices of memory, which can be added with `js_addview`
* `js_addview(variable, size, type)`
    * Adds slices of memory to the display (only works in memview `MODE_MAP`)
    * type can be any of the following: `AS_CHARS, AS_BYTES, AS_SHORTS, AS_WORDS` 
    * Note that size should be given in respect to the given type, not in bytes. So an integer array `a` with three elements should be passed as: `js_addview(a, 3, AS_WORDS)`
* `js_removeview(variable)`
    * Removes all views of `variable` (if it exists), making sure that each view it removes holds the same address of `variable`. This means that if you have two variables `i`, each in different places on the stack, this function will only remove the variable `i` being passed to the function.
* `js_removeview_weak(variable)`
    * Removes all views of any variable whose name matches that of `variable`, ignoring its address
* `js_removeview_all()`
    * Removes all existing views
* `js_break()`
    * Manual breakpoint that can be used to either pause execuption in non single-step mode, or add extra breakpoints in single-step mode
    * This function won't always show the correct line, unless you put a semi-colon right before it like such: `;js_break();`. If for whatever reason you cannot do that (maybe in something like in the header of a `for` loop), you can use `js_break_explicit(line)` and provide the given line number.
* io functions:
    * `console_string(s)`, `console_char(c)`, `console_int(i)` all currently work as expected
    * A lightweight version of `printf` also works. I currently only have it supporting `%d/%i, and %s`. This is going to be fixed soon (possibly by just switching to emscriptens printf).
    * Note that the console is also piped to the terminal on the bottom right of the screen


# Installation
#### Dependencies
* [emcc](https://emscripten.org/docs/getting_started/downloads.html)

#### Running
* `npm install` 
* `npm run build`
* Navigate to `http://localhost:8080`

# Credits
All credit for the split-screen and resizing goes to [Phuoc Nguyen](https://phuoc.ng/collection/html-dom/create-resizable-split-views/)