const cheerio = require('cheerio');
const mjAPI = require('mathjax-node');
const he = require('he');

mjAPI.config({
  MathJax: {
    
  },
});
mjAPI.start();

const generateOutputXml = (input, rawMml, index) => {
  // JATS wants MathML with the mmml: namespace at the front of all of its tags
  const mml = rawMml
    .replace(/</g, '<mml:')
    .replace(/<mml:\//g, '</mml:')
    .replace(/<mml:!--/g, '<!--');

  return input
    .replace('<alternatives>', `<alternatives>${mml}`)
    .replace(
      `</alternatives>`,
      `<inline-graphic xlink:href="images/displayformula_${index}.svg" /></alternatives>`,
    )
    .replace(/<!--\[CDATA\[/g, '<![CDATA[')
    .replace(/\]\]-->/g, ']]>');
};

const mathJaxWrapper = latex =>
  mjAPI
    .typeset({
      math: latex,
      format: 'TeX',
      svg: true,
      mml: true,
    })
    .then(data => {
      return data;
    })
    .catch(err => {
      console.error('MathJax error:', err);
      return { errors: err };
});

const convertMathJax = latex => mathJaxWrapper(latex);

module.exports = function async(eleventyConfig) {
  eleventyConfig.addFilter('makeSvgsFromLatex', async function async(source, replaceHtml = false) {
    const inlineSvgList = []
    const displaySvgList = []
    const latestSource = source.split(/&nbsp;/g).join(' ')
    const $ = cheerio.load(latestSource, { xmlMode: true })

    const displayFormulas = $(
      replaceHtml ? 'math-display' : 'disp-formula',
    ).toArray()

    for (let i = 0; i < displayFormulas.length; i++) {
      const elem = displayFormulas[i]
      const internal = $(elem).html()
      const output = `<disp-formula>${internal}</disp-formula>`

      const latex = replaceHtml
        ? internal
        : internal.split('[CDATA[')[1].split(']]')[0]

      const decodedLatex = he.decode(latex)

      console.error('Converting disp-formula: ', decodedLatex)
      // eslint-disable-next-line no--in-loop
      const data = await convertMathJax(decodedLatex)
      if (!data.errors) {
        displaySvgList[i] = data.svg

        const replacement = replaceHtml
          ? data.svg
          : generateOutputXml(output, data.mml, i)

        $(elem).replaceWith(replacement)
      }
    }

    // 2. go through the source and find all inline equations

    const inlineFormulas = $(
      replaceHtml ? 'math-inline' : 'inline-formula',
    ).toArray()

    for (let i = 0; i < inlineFormulas.length; i++) {
      const elem = inlineFormulas[i]
      const internal = $(elem).html()
      const output = `<inline-formula>${internal}</inline-formula>`

      const latex = replaceHtml
        ? internal
        : internal.split('[CDATA[')[1].split(']]')[0]

      const newLatex = latex.replace(/\\/g, '').replace(/&gt;/g, '>');

      console.error('Converting inline-formula: ', newLatex)
      // eslint-disable-next-line no--in-loop
      const data = await convertMathJax(newLatex)
      if (!data.errors) {
        inlineSvgList[i] = data.svg

        const replacement = replaceHtml
          ? data.svg
          : generateOutputXml(output, data.mml, i)

        $(elem).replaceWith(replacement)
      }
    }

    return $.html();
  });
};