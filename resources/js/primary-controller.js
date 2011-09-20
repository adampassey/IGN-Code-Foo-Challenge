$(document).ready(function() {
	
	//	question #2 size fade(s)
	$('.sizes li').mouseover(function() {
		$('span', this ).stop().animate( { opacity: 1.0 }, 250 );
	}).mouseout(function() {
		$('span', this ).stop().animate( { opacity: 0.0 }, 250 );
	});
	
	//	image fade-in on load
	$('body img').load(function() {
		$(this).animate({
			opacity: 1.0
		}, 200)
	}).each(function() {
		if( $(this).get(0).complete && $(this).get(0).naturalWidth !== 0 ) {
			$(this).trigger('load');
		}
	});
	
	//	perk click
	$('#perkList li a').click(function() {
	
		//	remove all other 'active' perks
		$('#perkList li a').each(function() {
			$(this).removeClass( 'active' );
		});
	
		//	make this the 'active' perk
		$(this).addClass( 'active' );

		var index = $(this).parent().prevAll().length;	
		index += 2;
		
		//	fade out all the perk descriptions
		$('#perkDescription li').each(function() {
			$(this).stop().animate({opacity: 0}, 250);
		});
		
		//	fade in this perk description
		$('#perkDescription li:nth-child('+index+')').stop().animate({opacity: 1.0}, 250);
		
		return false;
	});
	
	/*
	//	set the perk description height
	if( $('#perkList').length ) {
		var height = $('#perkList').height();
		$('#perkDescription').css( { height:height } );
	}
	*/
	
	var currentMargin = 0;
	var profileImageWidth = 230; 
	var profileOptions = 5;
	var profileSections = 3;
	
	var rotateProfile = function() {
	
		//	I'm going to set a random index to choose
		//	that way it doesn't feel so repetitive
		var currentProfileIndex = Math.floor( Math.random() * profileSections ) + 1;
	
		//	get the current margin
		currentMargin = $('#profile li:nth-child('+currentProfileIndex+') img').css( 'marginLeft' );
		if( currentMargin == undefined )
			currentMargin = 0;
		else
			currentMargin = currentMargin.replace('px', '' );
		
		var newMargin = currentMargin;
		
		while( newMargin == currentMargin ) {
		
			newMargin = Math.floor( Math.random() * ( profileOptions ) );
			newMargin = newMargin * profileImageWidth;
			
		}

		//	rotate the current index
		$('#profile li:nth-child('+currentProfileIndex+') img').animate( {'marginLeft' : -newMargin + 'px' },500);
	}
	
	if( $('#profile').length > 0 ) {
	
		var profileInterval = setInterval( rotateProfile, 1000 );
	}
	
});