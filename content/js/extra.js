function create(htmlStr) {
    var frag = document.createDocumentFragment(),
        temp = document.createElement('div');
    temp.innerHTML = htmlStr;
    while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
    }
    return frag;
}

var done = false;

function modifyCodeBlocks(event) {
    if (done) return;
    done = true;
    const pres = document.getElementsByTagName("pre");
    for (var source of pres) {
        var code_el = source.getElementsByTagName("code")[0];
        var lang = null;
        for (var cl of code_el.classList) {
            if (cl.startsWith("language-")) {
                lang = cl.substring(9);
            }

        }
        const valid_languages = ["cpp", "c"];
        if (valid_languages.indexOf(lang) == -1)
            continue;

        var lang_translation = new Map();
        lang_translation.set("cpp", "c++");
        lang_translation.set("c", "c");

        var lang_compiler = new Map();
        lang_compiler.set("cpp", "clang_trunk");
        lang_compiler.set("c", "cclang_trunk");

        var lang_options = new Map();
        lang_options.set("cpp", "-std=c++20");
        lang_options.set("c", "");

        var godbolt_source = source.innerText;

        if (["cpp", "c"].indexOf(lang) != -1) {
            includes = code_el.getElementsByClassName("hljs-meta-keyword");
            var replacements = [];
            for(inc of includes) { 
                if (inc.innerText != "include")
                    continue;

                if (inc.nextSibling == null || inc.nextSibling.nextSibling == null)
                    continue;

                const span = inc.nextSibling.nextSibling;
                const linkText = span.innerText

                if (!linkText.startsWith('"') || !linkText.endsWith('"'))
                    continue;

                if (linkText.indexOf("/") == -1)
                    continue;

                const link = document.createElement('a');
                const displayPath = linkText.substring(1, linkText.length - 1);
                const absolutePath = window.location.origin + "/" + displayPath;
                link.href = absolutePath;
                var replacementNode = span.cloneNode(true);
                replacementNode.innerText = "<" + displayPath + ">";
                link.appendChild(replacementNode);

                var godbolt_span = span.cloneNode(true);
                godbolt_span.innerText = "<" + absolutePath + '>';
                span.parentNode.replaceChild(godbolt_span, span);

                replacements.push([godbolt_span.parentNode, link, godbolt_span])
            }
            godbolt_source = source.innerText.slice(0);
            for (replacement of replacements) {
                replacement[0].replaceChild(replacement[1], replacement[2])
            }
        }

        var blub = {
            sessions:
                [
                    {
                        id: 1,
                        language: lang_translation.get(lang),
                        source: godbolt_source,
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
        // console.log(JSON.stringify(blub))
        var url = "https://godbolt.org/clientstate/" + btoa(JSON.stringify(blub));
        var el = create("<div class=\"tooltip-container godbolt-link\"><a target=\"blank\" href=\"" + url + "\"><img src=\"/static/favicon.ico\"></img></a><span class=\"tooltiptext\">View in Compiler Explorer</span></div>");

        source.appendChild(el);

    }
    for (var tooltiptext of document.getElementsByClassName("tooltiptext")) {
        tooltiptext.style.marginLeft = `-${tooltiptext.offsetWidth - 14}px`;
    }
}

addEventListener("DOMContentLoaded", modifyCodeBlocks);
