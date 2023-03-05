export default function welcomePage( { onContinueClick } ) {

	const root = document.createElement( 'div' );
	root.className = 'welcome-page';
	root.innerHTML = `
        <h1 class="typewriter">Game Of Life</h1>
        <p class="press-to-continue">>> <span>Press to continue</span> &#60;&#60;</p>
    `;

	const pressToContinue = root.getElementsByClassName( 'press-to-continue' )[ 0 ];
	pressToContinue.addEventListener( 'click', onContinueClick );

	return root;

}
