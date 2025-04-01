function create(htmlStr) {
    var frag = document.createDocumentFragment(),
        temp = document.createElement('div');
    temp.innerHTML = htmlStr;
    while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
    }
    return frag;
}

for (var source of document.getElementsByTagName("pre")) {
    var code_el = source.getElementsByTagName("code")[0];
    console.log(code_el.classList);
    var lang = null;
    for (var cl of code_el.classList) {
        if (cl.startsWith("language-")) {
            lang = cl.substring(9);
        }

    }
    console.log(lang);
    const valid_languages = ["cpp", "c"];
    console.log();
    if (valid_languages.indexOf(lang) == -1)
        continue;

    var lang_translation = new Map();
    lang_translation.set("cpp", "c++");
    lang_translation.set("c", "c");
    console.log(lang_translation.get(lang));

    var lang_compiler = new Map();
    lang_compiler.set("cpp", "clang_trunk");
    lang_compiler.set("c", "cclang_trunk");

    var lang_options = new Map();
    lang_options.set("cpp", "-std=c++20");
    lang_options.set("c", "");


    var blub = {
        sessions:
            [
                {
                    id: 1,
                    language: lang_translation.get(lang),
                    source: source.innerText,
                    compilers: [ {
                        id: lang_compiler.get(lang),
                        libs: [],
                        options: lang_options.get(lang)
                    } ],
                    executor: [
                        {
                            compiler:
                                {
                                    id: lang_compiler.get(lang),
                                    libs: [],
                                    options: lang_options.get(lang)
                                }
                        }
                    ]
                }
            ]
    }
    console.log(JSON.stringify(blub))
    var url = "https://godbolt.org/clientstate/" + btoa(JSON.stringify(blub));
    var el = create("<div class=\"tooltip-container godbolt-link\"><a target=\"blank\" href=\"" + url + "\"><img src=\"https://godbolt.org/favicon.ico?v=1\"></img></a><span class=\"tooltiptext\">View in Compiler Explorer</span></div>");

    source.appendChild(el);

}
for (var tooltiptext of document.getElementsByClassName("tooltiptext")) {
    tooltiptext.style.marginLeft = `-${tooltiptext.offsetWidth - 14}px`;
}
