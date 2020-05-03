const fs = require("fs");
const Papa = require("papaparse");
const data = Papa.parse(fs.readFileSync("spam.csv").toString()).data;
data.sort(() => Math.random() - 0.5)
const classes = {
    spam: "",
    ham: ""
}
data.slice(0, data.length * 0.8).forEach(([clazz, value]) => {
    if (classes[clazz] !== undefined) {
        classes[clazz] += value;
    }
})

function zeros(arr) {
    let obj = {};
    arr.forEach(key => {
        obj[key] = 0;
    })
    return obj;
}

function Bayes(classes, wordz) {
    let words;
    if (!wordz) {
        Object.entries(classes).forEach(([key, value]) => {
            classes[key] = value.split(" ").map(word => word.replace(/\W/g, "").toLowerCase());
        })
        words = {};
        Object.entries(classes).forEach(([clazz, wordList]) => {
            wordList.forEach(word => {
                if (!words[word]) {
                    words[word] = {};
                }
                if (words[word][clazz]) {
                    words[word][clazz] += 1;
                } else {
                    words[word][clazz] = 1;
                }
            })
        });
        Object.keys(classes).forEach(clazz => {
            Object.entries(words).forEach(([word, total]) => {
                if (total[clazz]) {
                    words[word][clazz] += 1;
                } else {
                    words[word][clazz] = 1;
                }
            })
        });
        let totals = zeros(Object.keys(classes));
        Object.keys(classes).forEach(clazz => {
            Object.values(words).forEach(total => {
                totals[clazz] += total[clazz]
            })
        })
        Object.entries(words).forEach(([word, total]) => {
            Object.entries(total).forEach(([clazz, val]) => {
                words[word][clazz] = Math.log10(val / totals[clazz]);
            })
        });
    } else {
        words = wordz;
    }
    return {
        classify(str) {
            let clazzez = zeros(Object.keys(words[Object.keys(words)[0]]));
            str.split(" ").forEach(word => {
                word = word.replace(/\W/g, "").toLowerCase();
                if (words[word]) {
                    Object.keys(clazzez).forEach(clazz => {
                        clazzez[clazz] += words[word][clazz]
                    })
                }
            });
            return Object.entries(clazzez).reduce((t, v) => v[1] > t[1] ? v : t)[0];
        },
        percentRight(data) {
            let right = 0;
            data.forEach(([clazz, value]) => {
                const output = this.classify(value);
                if (output === clazz) {
                    right++;
                }
            })
            return right / data.length;
        },
        toJSON() {
            return words;
        }
    }
}
Bayes.fromJSON = words => Bayes({}, words);
module.exports = Bayes;