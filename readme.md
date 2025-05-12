# Codelet

C visualization tool
<p align="center">
<img width="700" alt="Screen Shot 2025-05-11 at 8 28 07 PM" src="https://github.com/user-attachments/assets/7257c92d-f796-4367-8075-ce12c25d3894" />
<img width="700" alt="Screen Shot 2025-05-11 at 8 23 11 PM" src="https://github.com/user-attachments/assets/c2bef6a0-b9d8-4448-858c-57b89753a3cb" />
</p>

# Currently Working
* Single-stepping
* Shows the parts of memory that changed after each line

### Plans
* Learning mode with hands on activities
* UI and speed improvements
* Offloading from local server to either external on running emcc in the browser itself

### Usage

##### Interface
* The `play` button is used to compile and start the program
* The `step` button is used to step to the next instruction. Note that this isn't perfect since I essentially run your code through a small preprocessor that tries to insert breakpoints where possible. If you find any bugs please let me know! You can also insert manual breakpoints with `js_break(line)` (see below).
* The `pause` button will cause the program to run normally, as opposed to single-step mode. Manual breakpoints will still pause execution however. Upon clicking it, it will turn into a `stop` button, which when clicked turns the program back into single-step mode
#### JS interop functions
* `js_memview(MODE_DUMP or MODE_MAP)`
    * Switches between memory display modes. 
    * `MODE_DUMP` will just display a dump of a large section of memory
    * `MODE_MAP` shows slices of memory, which can be added with `js_addview`
* `js_addview(variable, size, type)`
    * Adds slices of memory to the display (only works in memview `MODE_MAP`)
    * type can be any of the following: `AS_CHARS, AS_BYTES, AS_SHORTS, AS_WORDS` 
    * Note that size should be given in respect to the given type, not in bytes. So an integer array `a` with three elements should be passed as: `js_addview(a, 3, AS_WORDS)`
* `js_break(line)`
    * Manual breakpoint that can be used to either pause execuption in non single-step mode, or add extra breakpoints in single-step mode
    * Note that you currently **must** pass the current line number as `line` in order to have program display the stopped instruction correctly. I am working to get rid of this!
* io functions:
    * `console_string(s)`, `console_char(c)`, `console_int(i)` all currently work as expected
    * A lightweight version of `printf` also works. I currently only have it supporting `%d/%i, and %s`. This is going to be fixed soon (possibly by just switching to emscriptens printf).
    * Note that the console is also piped to the terminal on the bottom right of the screen


# Installation
### Dependencies
* [emcc](https://emscripten.org/docs/getting_started/downloads.html)

### Running
* `npm install` 
* `npm run build`
* Navigate to `http://localhost:8080`

## Credits
All credit for the split-screen and resizing goes to [Phuoc Nguyen](https://phuoc.ng/collection/html-dom/create-resizable-split-views/)