---
id: range constrained types in C++
aliases:
  - constrained types
tags:
  - cpp
  - c++
---


One of the most common bugs in modern software is the humble buffer overflow.
In its simplest form this can happen when an array is accessed out of bounds:

```cpp
int arr[5];

int foo(int i) {
    return arr[i];
}

int main() {
    return foo(5);
}
```
The code above causes [🌩*Undefined Behavior*🌩](https://blog.regehr.org/archives/213)<sup>TM</sup>.
That is to say that the standard doesn't specify what the output of the program is supposed to be, and, in principle, a compiler could produce an executable that does *anything*.

More likely than not though `foo` will simply compile to machine code that reads and returns the memory at `&arr + i*sizeof(int)`.
Since the array only occupies memory up to `&arr + 4*sizeof(int)`, calling `foo` like above will read the memory of whatever object the compiler decided to place after `arr`.

In this respect C-style arrays are considered unsafe, and many "modern" C++ style guides suggest using `std::array` instead.
Objects of this type implement the `at` function which checks that the supplied index is within the bounds of the array.
If it isn't the it throws an exception.

```cpp
#include <array>

std::array<int, 5> arr;

int foo(int i) {
    return arr.at(i);
}

int main() {
    return foo(5);
}
```

Now the program will (predictably!) fail.
And of course we could add error handling by catching the exception.
Somewhat annoyingly though, there are also lots of folks who consider using exceptions at all to be [bad practice](http://shanekirk.com/2015/06/c-exceptions-the-good-the-bad-and-the-ugly/). 
If we compile the code with clang and `-fno-exceptions` the code above will still compile (and still fail) but we couldn't add try-catch blocks anymore, precluding any error handling.

And besides, who wants bounds checks anyway?
We are writing C++ afterall. What we want is **performance**! Every unnecessary instruction brings dishonor to us and our family.
When iterating over an array the fancy new `std::array` type can still help us out.
Using a range based for-loop allows us to access all array elements without bounds checking, and the guarantee that we don't overflow the buffer.

```cpp
#include <array>

std::array<int, 5> arr;

int sum() {
    int x = 0;
    for (int el : arr) {
        x += el;
    }
    return x;
}
```



