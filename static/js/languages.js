const selector = document.getElementById('languageSelector')
const storage = window.localStorage.getItem('language')
const navigatorLang = navigator.language || navigator.userLanguage;

const initLang = storage || navigatorLang.toLowerCase()

const intersectArrays = (arr1, arr2) => {
	return arr1.filter(value => arr2.map(value => value.toLowerCase()).includes(value.toLowerCase()));
}

const changeLanguage = (event) => {
  const newLanguage = event.target.value;
  window.localStorage.setItem('language', newLanguage);

  const pathSegments = window.location.pathname.split('/').filter(segment => segment !== '');

  const existingLanguage = config.languages.map(lang => lang.toLowerCase()).includes(newLanguage.toLowerCase());

  const languageInPath = intersectArrays(pathSegments, config.languages);

  if (languageInPath.length === 0) {
    pathSegments.push(newLanguage);
    window.location.pathname = pathSegments.join('/');
  } else {
    const index = pathSegments.map(lang => lang.toLowerCase()).indexOf(languageInPath[0].toLowerCase());
    if (existingLanguage) {
      pathSegments[index] = newLanguage;
      window.location.pathname = pathSegments.join('/');
    }
  }
}


if(selector.length){
	selector.addEventListener('change', changeLanguage);

	const pathSegments = window.location.pathname.split('/');
	const existingLanguage = config.languages.map(lang => lang.toLowerCase()).includes(pathSegments[1].toLowerCase());
	if (existingLanguage) {
		selector.value = pathSegments[1];
	}
  NiceSelect.bind(selector);
}