for (var source of document.getElementsByTagName("pre")) {
    var blub = {
        sessions:
            [
                {
                    id: 1,
                    language: "c++",
                    source: source.innerText,
                    compilers: [],
                    executor: [
                        {
                            compiler:
                                {
                                    id: "clang_trunk",
                                    libs: [],
                                    options: "-std=c++20"
                                }
                        }
                    ]
                }
            ]
    }
    var url = "https://godbolt.org/clientstate/" + btoa(JSON.stringify(blub))
}
