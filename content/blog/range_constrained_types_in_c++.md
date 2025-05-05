---
id: range constrained types in C++
aliases:
  - constrained types
tags:
  - cpp
  - c++
---

One of the most software bugs is the humble buffer overflow. In its simplest
form this can happen when an array is accessed out of bounds:

```cpp
int arr[5];

int foo(int i) {
    return arr[i];
}

int main() {
    return foo(5);
}
```

The code above causes
[🌩*Undefined Behavior*🌩](https://blog.regehr.org/archives/213)<sup>TM</sup> (or
UB for short). That is to say that a standard-compliant compiler can produce
code that does *literally anything*. Roughly speaking this is to give the
compiler more leeway in making aggressive optimizations: it means that it can
assume UB never happens and optimize the code based on that assumption.

So more likely than not `foo` will simply compile to machine code that reads and
returns the memory at `&arr + i` (in fact you can click the little green "C" in
the corner of the code to see that clang's codegen goes exactly that). Since the
array only occupies memory up to `&arr + 4`, calling `foo` like above will try
to read the memory of whatever object the compiler decided to place after `arr`.
If that object is always the same, then executing the binary will consistently
produce the same return code. Or maybe there is no object after `arr` and the
address right after `arr` is not mapped to a region that the created process is
allowed to read, resulting in a SEGFAULT.

In this respect C-style arrays are considered unsafe, and many "modern" C++
style guides suggest using `std::array` instead. Objects of this type implement
the `at` function which checks that the supplied index is within the bounds of
the array. If it isn't, it throws an exception.

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

Now the program will (predictably!) fail; And of course we could add error
handling by catching the exception. Somewhat annoyingly though, there are also
lots of folks who consider using exceptions at all to be
[bad practice](http://shanekirk.com/2015/06/c-exceptions-the-good-the-bad-and-the-ugly/).
If we compile the code with clang and `-fno-exceptions` the code above will
still compile (and still fail) but whenever any element is accessed out of
bounds, the program will call `abort` killing the process and precluding any
error handling.

And besides, who wants bounds checks anyway? We are writing C++ after all. What
we want is ***performance***! Every unnecessary CPU cycle brings dishonor to us
and our family.

When *iterating* over an array the fancy new `std::array` type can still help us
out. Using a range based for-loop allows us to access all array elements without
bounds checking, and the guarantee that we don't overflow the buffer.

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

But what about accessing just a single element? In some other languages it is
possible to create integer subtypes, where only certain values allowed. Then the
api for array accesses could explicitly take only elements of that subtype;
let's call it `InRange<T, n, m>`, where `T` is an integral type, and `n` and `m`
are of type `T`. These objects then carry a value of type `T` that is somehow
guaranteed to be >= `n` and < `m`. Leaving aside the question of how to
implement this behavior for now, this is what `array`'s subscript operator could
look like:

```cpp
template<typename T, T n, T m>
class InRange;

template<typename T, size_t n>
class safe_array {
//...
public:
    T& operator[](InRange<size_t, 0, n> x) {
        return data[x];
    }
//...
private:
    T data[n];
};
```

Another way of thinking about this is that we are encoding a
[precondition](https://akrzemi1.wordpress.com/2013/01/04/preconditions-part-i/)
of `safe_array`'s subscript operator in the type system. So how can we design
`InRange` to guarantee this implied precondition? Ideally we would want to be
able to use it just like the integral type `T` that it is built on top of, i.e.
being able to do arithmetic, performing comparisons, etc.

For one thing whenever we create a new `InRange` object or assign to an existing
one from an arbitrary integer we need to obviously check that the constraint is
satisfied:

```cpp
template<typename T, T n, T m>
class InRange {
public:
    InRange(T value) : x(value) {
        if (!check_constraint())
            throw 1;
    }
    InRange<T, n, m>& operator=(T value) {
        x = value;
        if (!check_constraint())
            throw 1;
        return *this;
    }

private:
    bool check_constraint() {
        return (value >= n && value < m);
    }
    T x;
};
```

With the single-argument constructor objects of type `T` can now also implicitly
convert to `InRange<T, ...>` , meaning the introductory example already almost
works with our custom integer subtype. The only thing missing is some way of
retrieving the `x` from within `InRange`. By adding a conversion operator back
to `T` we can both fix this and partly achieve our objective of being able to
use `InRange<T, ...>` just like `T`:

```cpp
operator T() {
    return x;
}
```

The below will now compile:

```cpp
#include "static/in_range_naive.h"

safe_array<int, 5> arr;

int main() {
    InRange<int, 0, 5> var(3);
    var = var + 1;
    return arr[5] + var;
}
```

... however, we still have all the same problems as with `std::array` and `.at`:
a runtime check takes place when the 5 is implicitly converted to
`InRange<size_t, 0, 5>`, and when it fails an exception is thrown that has to
either be caught or else the process will terminate.

We also have runtime checks on the creation of, and assignment to `var`. While
any half-descent optimizer will likely be able to get rid of these here (after
all the compiler can see all the integer literals involved in the calculations)
this is not always the case and we would like a stronger guarantee that the
information available at compile-time is in fact used to eliminate unnecessary
checks.

Ideally it should also realize *at compile-time* that the access to `arr[5]` is
illegal, refusing to compile, instead of throwing an exception at run-time.
