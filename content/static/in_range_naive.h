#include <cstddef>

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
    operator T() {
        return x;
    }

private:
    bool check_constraint() {
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

