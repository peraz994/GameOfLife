import '../style.css';
import welcomePage from './pages/welcomePage';
import gameOfLifePage from './pages/gameOfLifePage';
import { loadingPage } from './pages/loadingPage';

const app = document.getElementById( 'app' );

const pages = {
	welcome: welcomePage( { onContinueClick: handleWelcomePageContinueClick } ),
	loading: loadingPage()
	// gameOfLife: gameOfLifePage()
};

function handleWelcomePageContinueClick() {

	app.replaceChildren( pages.loading );

	setTimeout( () => {

		app.replaceChildren( gameOfLifePage() );

	}, 1250 );

}

app.replaceChildren( pages.welcome );
