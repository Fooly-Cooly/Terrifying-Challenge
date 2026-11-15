import dedent from "./dedent.js";
window.lozad('.lozad, .poster').observe();

document.addEventListener( "DOMContentLoaded", function() {
/* Registers a trigger for webpage elements complete loading */
	let bgVideo     = document.querySelector( "#background>video" ),				/* Get largest screen dimension & background element */
		myOffcanvas = document.getElementById( "offcanvasNavigator" ),				/* Get bootstrap offcanvas menu */
		yearBtns    = document.getElementsByClassName( "nav-year" ),				/* Get year list nav buttons */
		bsOffcanvas = new bootstrap.Offcanvas( myOffcanvas ),						/* Initate bootstrap offcanvas menu */
		urlParams   = new URLSearchParams( window.location.search ).get( "year" ),	/* Gets page year from address bar */
		viewMax	    = screen.width > screen.height ? screen.width : screen.height;	/* Get largest screen dimension */	

	for( let i=0; i<yearBtns.length; i++ ) yearBtns[i].addEventListener( "click", load_json );

	document.getElementById( "OpenMenu" ).addEventListener( 'click', function (){

		this.classList.toggle('is-active');
		bsOffcanvas.toggle();
	});

	load_json( urlParams ? urlParams : '2022' ); /* Determine to use URL year or default */

	/* Selects the appropriate background animation resolution */
	if ( viewMax > 1600 )		bgVideo.setAttribute( "src" , "./vids/hallway_1920.m4v" );
	else if ( viewMax > 1280 )	bgVideo.setAttribute( "src" , "./vids/hallway_1600.m4v" );
	else if ( viewMax > 854 )	bgVideo.setAttribute( "src" , "./vids/hallway_1280.m4v" );
	else						bgVideo.setAttribute( "src" , "./vids/hallway_854.m4v" );

	bgVideo.setAttribute( "type" , "video/mp4" );
	bgVideo.load(); // If for some reason we do want to load the video after, for desktop as opposed to mobile (I'd imagine), use videojs API to load
	bgVideo.play();

	bgVideo=myOffcanvas=urlParams=viewMax=yearBtns=null;
});

/* Registers a trigger for webpage elements & resources complete loading */
window.addEventListener( 'load', close_loader, false );
function close_loader() {

	let loader = document.querySelector( '.loader' );
	loader.ontransitionend = (e) => { e.target.style.display = 'none'; };
	setTimeout( () => { loader.style.opacity = '0'; }, 4000 );
}

function load_json( year ) {
/* Retrieves movie info JSON and adds entries using templates */
	if ( isNaN( year ) )
		year = year.target.id;

	fetch( `./jsons/${year}.json` )
	.then( response => {

		if (response.ok)
			return response.json();
		switch( response.status )
		{
			case 400: throw new Error( '400 Bad Request' ); break;
			case 401: throw new Error( '401 Unauthorized' ); break;
			case 403: throw new Error( '403 Forbidden' ); break;
			case 404: throw new Error( `404 File Not Found: ${response.url}` ); break;
			case 408: throw new Error( '408 Request Timeout' ); break;
			case 429: throw new Error( '429 Too Many Requests' ); break;
			default:  throw new Error( `${response.status} Error Occured` );
		}
	})
	.then( (movies) => {

		window.scroll( {top: 0} )
		{
			let body      = document.getElementById( 'articles' ),
				mystCar   = document.getElementById( 'mysteryCarousel' ),
				navBar    = document.getElementById( 'navBar' ),
				vidBanner = document.getElementById( 'banner' ),
				vidBanSrc = document.createElement( 'source' ),
				yearNode  = document.getElementById( year ),
				yearCaro  = document.getElementById( "historyCarouselControls" ), /* Get bootstrap year carousel */
				yearBtns  = document.getElementsByClassName( "nav-year" ),
				yearIndx  = Array.prototype.indexOf.call( yearNode.parentNode.parentNode.children, yearNode.parentNode ),
				bodyClone = body.cloneNode( true ),
				mystClone = mystCar.cloneNode( true ),
				navClone  = navBar.cloneNode( true ),
				accordM   = mystClone.querySelector( '#accordionMyst' ),
				accordR   = mystClone.querySelector( '#accordionRev' ),
				parser    = new DOMParser(),
				observer  = new IntersectionObserver( function( entries ) {

					entries.forEach( x => {

						let target = document.getElementById( `navBtn${x.target.id}` );
						x.isIntersecting ? target.classList.add( 'active' ) : target.classList.remove( 'active' );
					});
				}, { threshold: [0.5] } );

			/* Highlights the page nav button */
			for( let i = 0; i < yearBtns.length; i++ )
				yearBtns[i].classList.remove( "active" )
			yearNode.classList.add( "active" ); 
			new bootstrap.Carousel( yearCaro ).to( yearIndx );

			/* Empties Containers' Contents*/
			vidBanner.innerHTML=bodyClone.innerHTML=navClone.innerHTML=accordM.innerHTML=accordR.innerHTML = '';

			/* Sets the video banner per year | Need to optimize video banner loading */
			vidBanSrc.setAttribute( 'src', `./vids/${year}.mp4` );
			vidBanSrc.setAttribute( 'type', 'video/mp4' );
			vidBanner.appendChild( vidBanSrc );
			vidBanner.load();
			vidBanner.play();

			/* Creates a Virtual DOM and adds each movie entry from the JSON object */
			for ( let i=0; i<movies.length; i++ ) {

				switch ( movies[i].isMystery ) {
					case '1':
						accordM.innerHTML += template_secrets( movies[i], i, 1 );
						accordR.innerHTML += movies[i].title ? template_secrets( movies[i], i, 0 ) : '';
						break;
					default:
						let num    = humanize( i+1 ),
							navBtn = parser.parseFromString( `<li id="navBtn${i}" class="nav-item"><a class="nav-link fs-4" href="#">${num}</a></li>`, 'text/html' ).body.firstChild,
							entry  = parser.parseFromString( template_entry( movies[i], i ), 'text/html' ).body.firstChild;

						observer.observe( entry );
						navBtn.firstChild.setAttribute( "index", i );
						navBtn.firstChild.addEventListener( 'click', navBar_Click );
						navClone.appendChild(navBtn);
						bodyClone.appendChild(entry);
				}
			}

			/* Replaces DOM elements with generated Virtual DOM elements */
			body.replaceWith( bodyClone );
			mystCar.replaceWith( mystClone );
			navBar.replaceWith( navClone );
			movies=body=mystCar=navBar=bodyClone=mystClone=navClone=accordM=accordR=parser=observer=yearNode=yearIndx=yearCaro=yearBtns=null;
		}
	})
	.catch( error => { console.log( error ); });
}

function navBar_Click() {

	let sect = event.target.getAttribute('index'),
		rect = document.getElementById( sect ).getBoundingClientRect(),
		top  = (rect.top + window.scrollY) - 200;

	event.preventDefault();
	window.scroll( {top: top} );
}

function template_entry( obj, i ) {

	return dedent`
		<article class="scroll-sect" id="${i}">
			<table width="100%" height="100%">
				<tbody>
					<tr><td rowspan="8" class="text-center"><img class="poster" src="${obj.poster}" loading="lazy"></td></tr>
					<tr><td colspan="2" class="text-center"><h2>${obj.title}</h2></td></tr>
					<tr>
						<td class="text-nowrap"><span class="float-end">Genre:</span></td>
						<td class="">${obj.genre}</td>
					</tr>
					<tr>
						<td class="text-nowrap"><span class="float-end">Year:</span></td>
						<td class="">${obj.year}</td>
					</tr>
					<tr>
						<td class="text-nowrap"><span class="float-end">Length:</span></td>
						<td class="">${obj.length}</td>
					</tr>
					<tr>
						<td class="text-nowrap"><span class="float-end">${obj.ratingNameOne}:</span></td>
						<td class=""><span class="rating skulls-${obj.ratingOne}"></span></td>
					</tr>
					<tr>
						<td class="text-nowrap"><span class="float-end">${obj.ratingNameTwo}:</span></td>
						<td class=""><span class="rating skulls-${obj.ratingTwo}"></span></td>
					</tr>
					<tr><td colspan="2" class="text-center"><a href="${obj.imdb}" class="imdb" target="_blank" rel="noopener noreferrer"></a></td></tr>
					<tr><td colspan="3"><p>${obj.summary}</p></td></tr>
				</tbody>
			</table>
		</article>`;
}
function template_secrets( obj, idx, mode ) {

	let accord = mode ? 'Myst':'Rev',
		entry = accord + idx;
		return dedent`
		<div class="accordion-item bg-dark">
			<h2 class="accordion-header" id="heading${entry}">
				<button class="accordion-button bg-dark collapsed chiller-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseMyst${idx}, #collapseRev${idx}" aria-expanded="false" aria-controls="collapse${entry}">
					${mode ? 'Secret':'Movie'}${idx}
				</button>
			</h2>
			<div id="collapse${entry}" class="accordion-body accordion-collapse bg-dark collapse row" aria-labelledby="heading${entry}" data-bs-parent="#accordion${accord}">
				<article>
					<table width="100%" height="100%">
						<tbody>
							<tr><td rowspan="8" class="text-center"><img class="poster" src="${mode ? obj.mPoster : obj.poster}" loading="lazy"></td></tr>
							<tr><td colspan="2" class="text-center"><h2>${mode ? '????' : obj.title}</h2></td></tr>
							<tr>
								<td class="text-nowrap"><span class="float-end">Genre:</span></td>
								<td class="">${obj.genre}</td>
							</tr>
							<tr>
								<td class="text-nowrap"><span class="float-end">Year:</span></td>
								<td class="">${mode ? '????' : obj.year}</td>
							</tr>
							<tr>
								<td class="text-nowrap"><span class="float-end">Length:</span></td>
								<td class="">${mode ? '????' : obj.length}</td>
							</tr>
							<tr>
								<td class="text-nowrap"><span class="float-end">${obj.ratingNameOne}:</span></td>
								<td class=""><span class="rating skulls-${obj.ratingOne}"></span></td>
							</tr>
							<tr>
								<td class="text-nowrap"><span class="float-end">${obj.ratingNameTwo}:</span></td>
								<td class=""><span class="rating skulls-${obj.ratingTwo}"></span></td>
							</tr>
							<tr><td colspan="2" class="text-center">${mode ? '' : '<a href="' + obj.imdb + '" class="imdb" target="_blank" rel="noopener noreferrer"></a>'}</td></tr>
							<tr><td colspan="3"><p>${mode ? obj.mSummary : obj.summary}</p></td></tr>
						</tbody>
					</table>
				</article>
			</div>
		</div>
	`;
}

function humanize( param ) {

	let num = parseInt( param, 10 );
	if ( num ) {

		let ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'],
			tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'],
			numString = num.toString();

		if (num < 0) throw new Error('Negative numbers are not supported.');
		if (num === 0) return 'zero';
		if (num < 20) return ones[num]; //the case of 1 - 20
		
		switch( numString.length ) {
			case 2:
				return `${tens[numString[0]]} ${ones[numString[1]]}`;
				break;
			case 3:
				return `${numString[1]}${numString[2]}` === '00' ? `${ones[numString[0]]} hundred` : `${ones[numString[0]]} hundred and ${humanize(+(numString[1] + numString[2]))}`;
				break;
			case 4:
				let end = +(numString[1] + numString[2] + numString[3]);
				if (end === 0) return `${ones[numString[0]]} thousand`;
				if (end < 100) return `${ones[numString[0]]} thousand and ${humanize( end )}`;
				return `${ones[numString[0]]} thousand humanize( end )`;
				break;
		}
	} else return param
}