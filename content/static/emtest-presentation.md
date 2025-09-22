---
title: Emtest
author: Jonas Beyer
theme:
    override:
        code: 
            alignment: left
            background: true
---

Fundamentally: Just a unittest framework.
---
# Write and Run Tests
<!-- column_layout: [1, 1] -->

<!-- column: 0 -->
```c
// test.c
#include <emtest/emtest.h>

static void testMinus(void){
    ASSERT_LONG_EQ(2, 1 + 1);    
}

static void testPlus(void){
    ASSERT_LONG_EQ(0, 1 - 1);    
}

TEST_SUITE_BEGIN(TestArithmetic) {
    ADD_TEST(testMinus),
    ADD_TEST(testPlus),
} TEST_SUITE_END(TestArithmetic, );

EMTEST_SUITES = {
    &TestArithmetic, NULL,
};
```
<!-- pause -->
<!-- column: 1 -->

```bash
cc test.c \
    -lgtest_driver \
    -lemtest \
    -lemtest_main \
    -lgtest
./a.out
```
<!-- pause -->
```
[==========] Running 2 tests from 1 test suite.
[----------] Global test environment set-up.
[----------] 2 tests from TestArithmetic, where TypeParam = 0
[ RUN      ] TestArithmetic.testMinus
[       OK ] TestArithmetic.testMinus (0 ms)
[ RUN      ] TestArithmetic.testPlus
[       OK ] TestArithmetic.testPlus (0 ms)
[----------] 2 tests from TestArithmetic (0 ms total)

[----------] Global test environment tear-down
[==========] 2 tests from 1 test suite ran. (0 ms total)
[  PASSED  ] 2 tests.
```
<!-- end_slide -->

Fundamentally: Just a unittest framework.
---

# Split tests across multiple Suites
<!-- column_layout: [1, 3, 1] -->

<!-- column: 1 -->
```c
void minus(void) {
    ASSERT_LONG_EQ(2, 1 + 1);    
}

void plus(void) {
    ASSERT_LONG_EQ(0, 1 - 1);    
}

TEST_SUITE_BEGIN(TestArithmetic) {
    ADD_TEST(plus),
    ADD_TEST(minus),
} TEST_SUITE_END(TestArithmetic, );

void lengthEmptyString(void) {
    ASSERT_ULONG_EQ(0, strlen(""));
}

TEST_SUITE_BEGIN(TestString) {
    ADD_TEST(lengthEmptyString),
} TEST_SUITE_END(TestArithmetic, );

EMTEST_SUITES = {
    &TestArithmetic, &TestArithmetic, NULL,
};
```
<!-- end_slide -->

Fundamentally: Just a unittest framework.
---

# Common setup, and teardown functions
<!-- column_layout: [1, 1] -->

<!-- column: 0 -->
```c
#include <emtrace/emtrace.h>
#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>

FILE* testFile = NULL;

void setup(void) {
    testFile = fopen("/tmp/testfile.bin", "w+");
    ASSERT_PTR_NE(NULL, testFile);
}

void teardown(void) {
    if (testFile != NULL) {
        fclose(testFile);
        testFile = NULL;
    }
    testFile = NULL;
}

```
<!-- column: 1 -->
<!-- pause -->
```c
void newEmpty(void) {
    fseek(testFile, 0, SEEK_END);
    ASSERT_LONG_EQ(0, ftell(testFile));
}

// more tests ...

TEST_SUITE_BEGIN(FileTests) {
    ADD_TEST(newEmpty),
    // more tests...
} TEST_SUITE_END(
    FileTests,
    .setup = setup,
    .teardown = teardown
);


EMTEST_SUITES = {
    &FileTests, NULL,
};
```
<!-- end_slide -->
Fundamentally: Just a unittest framework.
---

# Rich assertions
<!-- column_layout: [1, 1] -->

<!-- column: 0 -->
```c
void numberCrunching(void) {

  EXPECT_LONG_GREATER(10, 20);
  EXPECT_FLOAT_LESS(-0.4f, -10.0f);
  const double pi = 3.14;
  EXPECT_DOUBLE_IN_RANGE(pi, 0.0, 1.0);
}

void memory(void) {
  char string[] = "Hello";
  EXPECT_STREQ("Hi", string);
  EXPECT_STRNE("Hello", string);

  int someNumbers[sizeof(string)] = {1, 2, 3, 4};
  EXPECT_MEMEQ(someNumbers, string, sizeof(string));
}
```
<!-- pause -->
<!-- column: 1 -->
```
File: path/to/source/test.c:10
Assertion failed: 10 > 20
10 <= 20

File: path/to/source/test.c:11
Assertion failed: -0.4f < -10.0f
-0.400000 >= -10.000000

File: path/to/source/test.c:13
Assertion failed: pi in range [0.0, 1.0]
3.14 not in [0, 1]
```
<!-- pause -->
```
File: path/to/source/test.c:18
Assertion failed: "Hi" == string
Hi != Hello

File: path/to/source/test.c:19
Assertion failed: "Hello" != string
Hello == Hello

File: path/to/source/test.c:22
Assertion failed: MEMEQ(someNumbers,  string, sizeof(string))
mem @ 0x7ffd82d279d0 != mem @ 0x7ffd82d279f2 for 6 bytes
```
<!-- end_slide -->

So what makes it special?
---
<!-- pause -->
<!-- column_layout: [1, 8, 1] -->
<!-- column: 1 -->
<!-- newlines: 1 -->
# Designed to run on baremetal hardware:
<!-- newlines: 2 -->
<!-- incremental_lists: true -->
- minimal memory footprint
- only dependency is libc
- compatible with C99
- no dynamic memory management
- modular api allows starting the tests from anywhere programmatically
- can run tests, and get output on-chip with nothing but a debugger connection (or through any custom channel)


<!-- end_slide -->

Running Baremetal
---
<!-- jump_to_middle -->
<!-- alignment: center -->

Demo Can-Firmware...

<!-- end_slide -->

How do I use it?
---

<!-- column_layout: [1, 6, 1] -->
<!-- column: 1 -->
<!-- newlines: 1 -->
# State of the project
<!-- newlines: 2 -->
<!-- incremental_lists: true -->
- built with CMake, and most easily integrates with other projects also using CMake
- no properly versioned release yet
- nonetheless core API (asserts, and functions for starting tests, suites, etc.) is decently well tested, and should be pretty stable
- basic usage is documented, and repository includes a few examples
- integration with gdb works, but is untested, not very clean, and requires gdb built with python integration
- currently on a private git repo on our gitlab (code.siemens.com)
- I will give everyone here access, so you can try it out if you like; contact me if you need help with anything

<!-- newlines: 1 -->
# Future
- reimplement gdb integration
- make the project inner source
- if interests exists work towards 1.0.0 release with stable set of features

<!-- end_slide -->

