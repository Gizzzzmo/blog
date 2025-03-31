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
```cpp
template<int n>
class asdf {
private:
    consteval asdf(int x) x(x) {} 
    int x;
};

int main() {
   asdf<9> x; 
   const char* str = "blub";
}
```

