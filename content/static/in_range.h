#include <cstddef>

template<typename T, T n, T m>
class InRange {
public:
    consteval InRange(T value) : x(value) {
        if (!check_constraint())
            throw 1;
    }
    consteval InRange<T, n, m>& operator=(T value) {
        x = value;
        if (!check_constraint())
            throw 1;
        return *this;
    }
    constexpr operator T() {
        return x;
    }

private:
    constexpr bool check_constraint() {
        return (x >= n && x < m);
    }
    T x;
};

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

