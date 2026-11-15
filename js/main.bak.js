let year;
const lozad = window.lozad('.lozad, .poster');

/* Registers a trigger for webpage elements complete loading */
document.addEventListener( "DOMContentLoaded", function() {

	/* Gets page year from address bar */
	let urlParams = new URLSearchParams( window.location.search ).get( 'year' );
	year = urlParams ? urlParams : "2022";

	/* Get largest screen dimension & background element */
	let viewMax = screen.width > screen.height ? screen.width : screen.height;
	let bgVideo = document.querySelector( "#background>video" );

	/* Get bootstrap year carousel */
	let yearNode = document.getElementById( year );
	let yearIndx = Array.prototype.indexOf.call( yearNode.parentNode.parentNode.children, yearNode.parentNode );
	let yearCaro = document.getElementById( "historyCarouselControls" );

	/* Get bootstrap offcanvas */
	let btnOffcanvas = document.getElementById( "OpenMenu" );
	let myOffcanvas = document.getElementById( "offcanvasNavigator" );
	let bsOffcanvas = new bootstrap.Offcanvas( myOffcanvas );

	/* Selects the appropriate background animation resolution */
	if ( viewMax > 1600 )		bgVideo.setAttribute( "src" , "./vids/hallway_1920.m4v" );
	else if ( viewMax > 1280 )	bgVideo.setAttribute( "src" , "./vids/hallway_1600.m4v" );
	else if ( viewMax > 854 )	bgVideo.setAttribute( "src" , "./vids/hallway_1280.m4v" );
	else						bgVideo.setAttribute( "src" , "./vids/hallway_854.m4v" );

	bgVideo.setAttribute( "type" , "video/mp4" );
	bgVideo.load(); // If for some reason we do want to load the video after, for desktop as opposed to mobile (I'd imagine), use videojs API to load
	bgVideo.play();

	/* Highlights the page nav button */
	yearNode.classList.add( "active" );
	new bootstrap.Carousel( yearCaro ).to( yearIndx );

	/* Prevents the link used to open the menu from navigating to a new page*/
	btnOffcanvas.addEventListener( 'click', function ( e ){

		e.preventDefault();
		e.stopPropagation();
		bsOffcanvas.toggle();
		btnOffcanvas.classList.toggle('is-active');
	});
});

/* Registers a trigger for webpage elements & resources complete loading */
window.addEventListener( "load", function() {

	const swupObj = new Swup( {

		/* Swup Options */
		animateHistoryBrowsing: false,
		animationSelector: '[class*="transition-"]',
		containers: ["#swup", "#banner"],
		cache: true,
		linkSelector:
		'a[href^="' +
		window.location.origin +
		'"]:not([data-no-swup]), a[href^="./"]:not([data-no-swup]), a[href^="#"]:not([data-no-swup])',
		skipPopStateHandling: function(event) {
			if (event.state && event.state.source == "swup") {
				return false;
			}
			return true;
		}
	} );

	/* Registers triggers for swup content replacment */
	swupObj.on('clickLink', navBar_Click);
	swupObj.on('contentReplaced', navBar_load);
	swupObj.on('willReplaceContent', navBar_unload);

	/* Loads page based off address bar request */
	swupObj.loadPage({

		url: './' + year,
		method: 'GET',
	});

	setTimeout(function(){

		const loader = document.querySelector(".loader");
		loader.style.opacity = "0";
		setTimeout(function(){ loader.style.display = "none"; }, 500);
	},4000);
}, false );

function navBar_load() {

	let sectList = document.getElementsByClassName( "scroll-sect" );
	let navObj	 = document.getElementById( "navBar" );
	let template = document.getElementById( "tmp_navBtn" );
	let observer = new IntersectionObserver( function( entries ) {

		entries.forEach( x => {

			if ( x.isIntersecting )
				document.getElementById( "navBtn" + x.target.id ).classList.add( "active" );
			else
				document.getElementById( "navBtn" + x.target.id ).classList.remove( "active" );
		});
	}, { threshold: [0.5] });

	/* Generates Nav Buttons Automatically Based on Class */
	for (let i = 0; i < sectList.length; i++) {

		let node = template.cloneNode(true);
		node.id = "navBtn" + sectList[i].id;
		node.classList.remove( "d-none" );
		node.firstChild.href="#" + sectList[i].id;
		node.firstChild.innerHTML = sectList[i].id;
		navObj.appendChild(node);
		observer.observe( sectList[i] );
	}

	lozad.observe();
}

function navBar_Click( event ) {

	if ( event.target.classList.contains( "nav-link" ) ) {

		const sect	= document.getElementById( event.target.innerText );
		const rect	= sect.getBoundingClientRect();
		const top	= (rect.top + window.scrollY) - 200;
		window.scroll( {top: top} );
	}
	else if ( event.target.classList.contains( "nav-year" ) ) {

		document.getElementById( year ).classList.remove( "active" );
		event.target.classList.add( "active" );
		year = event.target.id;
	}
}

function navBar_unload() {

	window.scroll( {top: 0} )
	document.getElementById( "navBar" ).innerHTML = '';
}