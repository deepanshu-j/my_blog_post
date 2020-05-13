console.log('activity.js is connected to index.ejs');
var body = document.body;
function getRandomColorLight() {
	var letters = 'BCDEF'.split('');
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * letters.length)];
	}
	return color;
}

// setInterval(() => {
// 	body.style.backgroundColor = getRandomColorLight();
// }, 1000);

//////////use to color the body and the background of cards
//$('body').css({ 'background-color': '#ecf0f1' });
//$('.CARDS').css({ 'background-color': '#282a36' });

$('body.style.backgroundColor').fadeOut('fast', () => {
	///animation complete
});
//jquery
