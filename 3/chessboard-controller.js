//	The GameStates Enumerated Type
var MainGameState = {
	GameStatePause			:	0,
	GameStatePlay			:	1,
	GameStateFlowControl	:	2,
	GameStateMenu			:	3,
	GameStateLoad			:	4
};

//	The GameDebug Modes
var MainGameMode = {
	GameModeRelease			:	0,
	GameModeDebug			:	1,
	GameModeAwesome			:	2	//	reserved for future use...!
};

//	The current mouse status
var MouseStatus = {
	MouseStatusUp			:	0,
	MouseStatusDown			:	1
};

//	The chessboard tile touched enumerated type
var ChessboardTileState = {
	TileStateBlack			:	0,
	TileStateWhite			:	1,
	TileStateTouchable		:	2
};

//	the chessboard tile size
var ChessboardTileSize = {
	TileWidth				:	75,
	TileHeight				:	75
};

//	The Game class
function MainGame( Canvas, GameMode, Stages ) {

	//	we're currently loading
	this.State = MainGameState.GameStateLoad;
	
	//	set the game mode
	this.Mode = GameMode;
	
	//	set the canvas, and get the context to draw to
	this.Canvas = Canvas;
	this.Context = Canvas.getContext( '2d' );
	
	//	create the renderer
	this.Renderer = new Renderer();
	
	//	create a UIEventHandler
	//	pass it the canvas to listen to, and the
	//	observer (this for now)
	this.UIEventHandler = new UIEventHandler( this, Canvas );
	
	//	a collection of stages
	this.Stages = Stages;
	
	//	the beginning stage should be 0
	this.StageIndex = 0;
	
	//	<private> our update loop speed
	var MainGameCycles = 25;
	
	//	start the main game loop using the MainGameInterval 
	this.MainGameInterval;
	this.StartMainGameLoop( MainGameCycles );
	
	//	will need to add a loader here based on the stage
	//	not sure how this will work yet
	
	//	start the first stage
	this.GoToStage(this.StageIndex);

};

//	Prototyping the MainGame class
MainGame.prototype = {
	
	//	the main game loop
	MainGameLoop : function() {
		
		//	if we're in debug mode, calculate fps, etc.
		if( this.Mode == MainGameMode.GameModeDebug ) {		
		
			//	determine the FPS
			if( !this.LastMicroTime ) {
				this.LastMicroTime = MicroTime.Get();
				return;
			}
			
			var NewMicroTime = MicroTime.Get();
			this.FPS = MicroTime.CalculateFPS( this.LastMicroTime, NewMicroTime );
			
			this.LastMicroTime = NewMicroTime;
		}
		
		//	render the game -> passing fps is just temporary
		//	until the Renderer has been finalized
		//	I'd like to eventually pass the stage <done>...?
		//	or a series of objects that are within the
		//	canvas render view - haven't finalized this yet.
		this.Renderer.RenderFrame( this.Mode, this.Canvas, this.Context, this.Stages[this.StageIndex], this.FPS );
	},
	
	//	Start the Main Game Loop
	StartMainGameLoop : function( RefreshRate ) {
		console.log( 'Initiating the main game loop.' );
		var self = this;
		this.MainGameInterval = setInterval( function() { self.MainGameLoop(); }, RefreshRate );
	},
	
	//	set the stages on the fly
	SetStages : function( StagesArray ) {
		this.Stages = StagesArray;
	},
	
	//	go to a certain stage
	GoToStage : function( StageIndex ) {
		//	I'll need to load a map, etc.
		//	but for now, the stage will
		//	just intercept the UI events
		this.UIEventHandler.SetObserver( this.Stages[StageIndex] );
	},
	
	//	go to the next stage
	NextStage : function() {
		this.Stages ++;
		this.GoToStage( this.Stages );
	}
};

//	The UIEventHandler Class
function UIEventHandler( Observer, Canvas ) {
		
	//	shortcut to this object
	var self = this;
	
	//	the one receiving event notifications
	this.Observer = Observer;
	
	//	the current mouse position
	this.Point = new Point( null, null );
	
	//	the time since the mouse was clicked down
	//	and only set if it has not been released
	this.MouseDownTimer;
	
	//	the interval to continually send the observer
	//	the mouse held down event
	this.MouseDownInterval;
	
	//	the mouse status
	this.MouseStatus = MouseStatus.MouseStatusUp;
	
	//	get the current Point based on canvas offset
	var GetCanvasPoint = function( x, y ) {
		var CanvasPosition = new Point( Canvas.offsetLeft, Canvas.offsetTop );
		var ModifiedPoint = new Point( x - CanvasPosition.X(), y - CanvasPosition.Y() );
		return ModifiedPoint;
	};
	
	//	the event handlers
	this.OnMouseDownEvent = function( event ) {
		//console.log( 'UIEventHandler OnMouseDownEvent: ' + event.clientX + 'x, ' + event.clientY + 'y' );
		
		this.MouseStatus = MouseStatus.MouseStatusDown;
		this.MouseDownTimer = MicroTime.Get();
		
		this.MouseDownInterval = setInterval( function() { self.OnMouseHeldDownEvent(); }, 500 );
		
		var ModifiedPoint = GetCanvasPoint( event.clientX, event.clientY );
		
		if( self.Observer.OnMouseDownEvent )
			self.Observer.OnMouseDownEvent( ModifiedPoint );
	};
	
	this.OnMouseHeldDownEvent = function() {
		
		if( self.Observer.OnMouseHeldDownEvent )
			self.Observer.OnMouseHeldDownEvent();
	};
	
	this.OnMouseUpEvent = function( event ) {
		//console.log( 'UIEventHandler OnMouseUpEvent: ' + event.clientX + 'x, ' + event.clientY + 'y' );	
		
		this.MouseStatus = MouseStatus.MouseStatusUp;
		
		this.MouseDownInterval = clearInterval( this.MouseDownInterval );
		
		var ModifiedPoint = GetCanvasPoint( event );
		
		if( self.Observer.OnMouseUpEvent )
			self.Observer.OnMouseUpEvent( ModifiedPoint );
	};
	
	this.OnMouseMoveEvent = function( event ) {
		//console.log( 'UIEventHandler OnMouseMoveEvent: ' + event.clientX + 'x, ' + event.clientY + 'y' );
		
		var ModifiedPoint = GetCanvasPoint( event );
		
		if( self.Observer.OnMouseMoveEvent )
			self.Observer.OnMouseMoveEvent( ModifiedPoint );
	};
	
	this.OnKeyPressEvent = function( event ) {
		//console.log( 'UIEventHandler OnKeyPressEvent: ' + event.keyCode );
		
		if( self.Observer.OnKeyPressEvent )
			self.Observer.OnKeyPressEvent( event );
	};
	
	this.OnWindowDidResizeEvent = function( event ) {
		//console.log( 'UIEventHandler OnWindowDidResizeEvent: ' + event );
		
		if( self.Observer.OnWindowDidResizeEvent )
			self.Observer.OnWindowDidResizeEvent( event );
	};
	
	//	this has not been tested -
	//	may not be able to use a closure like this.
	this.UpdateMousePosition = function( x, y ) {
		
		this.Point.Set( { x : x, y : y } );
	};
	
	//	mouse events
	Canvas.addEventListener( 'mousedown', this.OnMouseDownEvent, false );
	Canvas.addEventListener( 'mouseup', this.OnMouseUpEvent, false );
	Canvas.addEventListener( 'mousemove', this.OnMouseMoveEvent, false );
	
	//	key events
	addEventListener( 'keydown', this.OnKeyPressEvent, false );
	addEventListener( 'resize', this.OnWindowDidResizeEvent, false );
	
	//	set the Object that will receive UI events
	this.SetObserver = function( Observer ) {
		this.Observer = Observer;
	};
	
};

//	The Renderer Class
function Renderer() {
	
	//	crickets...
};

//	Prototyping the Render class
Renderer.prototype = {
	
	RenderFrame : function( RenderMode, Canvas, Context, Stage, FPS ) {
	
		//	first, wipe the canvas
		//	may need to implement a way to 
		//	stop the wiping of the canvas
		Canvas.setAttribute( 'width', Canvas.width );
		
		//	if we're in debug mode, let's draw the 
		//	fps, etc. at the top left of the screen
		//	as of now only shows fps. Maybe I should
		//	add a debug object that holds all the debug info?
		if( RenderMode == MainGameMode.GameModeDebug ) {
			
			Context.fillText( 'FPS:' + FPS, 10, 15 );
		}
		
		//	render the stage
		Stage.Draw( Context );
	}
};

//	The Stage Class
function Stage() {

	this.Drawable = [];
	
	this.MousePosition = new Point(0, 0);
	
	//	This will render the stage
	//	drawing all objects in the 'Drawable' array
	//	allows the drawable array to be multidimensional,
	//	but will not draw objects more than 2 deep.
	//	Objects require a Draw( Context ) method to be drawn.
	//	!! 	I'd like to rework the renderer so it's based
	//		on the depth rather than when the object
	//		was added to the array.
	//	!!
	this.Draw = function( Context ) {
		for( i = 0; i < this.Drawable.length; i ++ ) {
			if( this.Drawable[i].length == null ) {
				this.Drawable[i].Draw( Context );
			} else {
				for( m = 0; m < this.Drawable[i].length; m ++ ) {
					this.Drawable[i][m].Draw( Context );
				}
			}
		}
	};
	
	this.OnMouseDownEvent = function( Point ) {
	};
	
	this.OnMouseHeldDownEvent = function() {
	};
	
	this.OnMouseMoveEvent = function( MovePoint ) {
		this.MousePosition = MovePoint;
	};
};

//	A time utility (to help determine fps)
//	staticly accessible
var MicroTime = {
	Get 	:	function() {

		var now = new Date().getTime() / 1000;
		var s = parseInt( now );
		
		return Math.round( (now-s) * 1000) / 1000;
	},
	CalculateFPS :	function( MicrotimeOne, MicrotimeTwo ) {
		return Math.round( 1000 / Math.round((MicrotimeTwo - MicrotimeOne) * 1000) );
	}
};

//	Point class
function Point( x, y ) {
	this.x = x;
	this.y = y;
	
	this.SetX = function( x ) { this.x = x; }
	this.SetY = function( y ) { this.y = y; }
	
	this.X = function() { return this.x; }
	this.Y = function() { return this.y; }
	
	this.Set = function( ClosurePoint ) {
		this.x = ClosurePoint.x;
		this.y = ClosurePoint.y;
	}
};

/** 
 * END OF GAME ENGINE 
 */

//	stage definitions
function Opening() {

	//	call the stage constructor
	Stage.call( this );
	
	//	to reference the automated game logic easily
	var self = this;
	
	//	the logic interval
	var LogicInterval = 200;
	
	//	layout the chess board
	//	chessboard are 8x8 tiles of alternating colors
	
	//	use a starting tile color to control the 
	//	tile color
	var TileColor = ChessboardTileState.TileStateWhite;
	var TileWidth = ChessboardTileSize.TileWidth;
	var TileHeight = ChessboardTileSize.TileHeight;
	var NumberOfMoves;
	var NumberOfTouchedTiles;
	var LowestEntries;
	var CurrentTile;
	var BestTile;
	var AutomatedMoveTimeout;
	var HasStarted = false;
	
	this.SetupChessboard = function( StartingRow, StartingColumn ) {
	
		NumberOfMoves = 0;
		NumberOfTouchedTiles = 0;
		LowestEntries = 9;
		this.Drawable = [];
		clearTimeout( AutomatedMoveTimeout );
	
		//	loop through each row and setup the tiles
		for( r = 0; r < 8; r ++ ) {
			for( c = 0; c < 8; c ++ ) {
			
				if( !this.Drawable[r] )
					this.Drawable[r] = [];
				
				var TilePosition = new Point( c * TileWidth, r * TileHeight );
				this.Drawable[r][c] = new ChessboardTile( TileColor, TilePosition, TileWidth, TileHeight, r, c ); 
				
				if( TileColor == ChessboardTileState.TileStateWhite )
					TileColor = ChessboardTileState.TileStateBlack;
				else
					TileColor = ChessboardTileState.TileStateWhite;
			}
			if( TileColor == ChessboardTileState.TileStateWhite )
				TileColor = ChessboardTileState.TileStateBlack;
			else
				TileColor = ChessboardTileState.TileStateWhite;
		}
		
		//	get the current tile
		CurrentTile = this.Drawable[StartingRow][StartingColumn];
		
		//	now let's create the knight piece
		//	and put him in the standard position
		this.Drawable[this.Drawable.length] = new Knight( CurrentTile.Position );
		
		//	then lets touch that starting tile.
		CurrentTile.Touched = true;
		
		//	start the timeout that will begin the automated logic
		//	this has been added to the click event handler - so the 
		//	user can choose when the demonstration begins.
		//AutomatedMoveTimeout = setTimeout( function() { self.CalculateMove(); }, LogicInterval );
		
		//	add the beginning message
		this.Drawable[this.Drawable.length] = new BeginningMessage();
	};
	
	//	this is the standard position to start the knight
	this.SetupChessboard( 7, 1 );
	
	//	this is what will calculate the moves at an interval (unless it finishes)
	this.CalculateMove = function() {
		
		//	check the entries on the current tile
		CurrentTile.CheckEntries( this.Drawable, true );
		
		//	loop through the tiles and see which has 
		//	the lowest entry (can't be the current tile)
		for( r = 0; r < 8; r ++ ) {
			for( c = 0; c < 8; c ++ ) {
				Tile = this.Drawable[r][c];
				if( Tile instanceof ChessboardTile ) {
					if( Tile.Entries <= LowestEntries && Tile.Entries >= 0 && Tile.Entries != null && Tile != CurrentTile && Tile.TileState !=  ChessboardTileState.TileStateTouched ) {
						BestTile = Tile;
						LowestEntries = Tile.Entries;	
					}
				}
				//	reset the entries after looking at them
				//	the entries technically do display, but they
				//	do so fast enough that nobody should see them.
				Tile.Entries = null;
			}
		}
		
		//	if we found the best tile, touch it and reset
		if( LowestEntries != null && BestTile instanceof ChessboardTile ) {	
		
			//console.log( 'Moving from tile: ' + CurrentTile.Position.X() + ' ' + CurrentTile.Position.Y() + ' to tile: ' +  BestTile.Position.X() + ' ' + BestTile.Position.Y());
			
			//	draw a line between the current tile
			//	and the new tile
			var NewLine = new TileLine( CurrentTile.Position, BestTile.Position );
			this.Drawable[this.Drawable.length] = NewLine;	
		
			CurrentTile = BestTile;
			LowestEntries = 9;
			
			CurrentTile.Touched = true;
			
			//	unfortunately, I overlooked repositioning the knight
			//	so in this case I'll have to do so using the
			//	drawable array. bleh. 
			for( i = 0; i < this.Drawable.length; i ++ )
				if( this.Drawable[i] instanceof Knight )
					this.Drawable[i].Position = CurrentTile.Position;
			
			if( NumberOfTouchedTiles < 64 && NumberOfMoves < 64 ) {
				AutomatedMoveTimeout = setTimeout( function() { self.CalculateMove(); }, LogicInterval );
				
				NumberOfTouchedTiles ++;
				NumberOfMoves ++;
				
			} else {
				
				//	add the success message
				this.Drawable[this.Drawable.length] = new SuccessMessage();
				
				//	draw some particles because we won!
				for( i = 0; i < 100; i ++ ) {
					var ParticlePoint = new Point( 300, 300 );
					var Particle = new RandomParticle( ParticlePoint );
					this.Drawable[this.Drawable.length] = Particle;
				}
			}

		//	else we either finished or got stuck
		} else {
		
			if( NumberOfTouchedTiles > 64 ) {
				
				//	reset the drawable array
				this.SetupChessboard( Math.floor(Math.random() * 7), Math.floor(Math.random() * 7));
			}
		}
		
	};
	
	//	reset the chessboard (or run it initially)
	this.OnMouseDownEvent = function( OriginPoint ) {
		
		//	reset the drawable array
		if( HasStarted ) {
			this.SetupChessboard( Math.floor(Math.random() * 7), Math.floor(Math.random() * 7));
		} else {
			HasStarted = true;
		}
		
		//	set the logic interval
		AutomatedMoveTimeout = setTimeout( function() { self.CalculateMove(); }, LogicInterval );
		
		//	remove any messages on the board
		for( i = 0; i < this.Drawable.length; i ++ )
			if( this.Drawable[i] instanceof BeginningMessage || this.Drawable[i] instanceof SuccessMessage ) {
				delete this.Drawable[i];
				this.Drawable.splice(i, 1);
			}
	};
	
	this.OnMouseHeldDownEvent = function() {
		console.log( 'OnMouseHeldDownEvent' );
	};
};

Opening.prototype = new Stage;
Opening.prototype.constructor = Opening;

//	a tile on the chessboard
function ChessboardTile( TileState, Position, Width, Height, Row, Column ) {
	
	this.TileState = TileState;
	this.Position = Position;
	this.Entries;					//	entries are how many moves this tile has
	this.TileRow = Row;
	this.TileColumn = Column;
	this.Touched = false;
	
	//	prepare the images used
	var Texture = new Image();
	
	if( this.TileState == ChessboardTileState.TileStateBlack ) 
		Texture.src = '../resources/img/tile-dark.png';
	else
		Texture.src = '../resources/img/tile-light.png';

	//	to draw the tile 
	this.Draw = function( Context ) {
	
		switch( this.TileState ) {
			
			case ChessboardTileState.TileStateBlack:
				Context.fillStyle = '#000000';
			break;
			
			case ChessboardTileState.TileStateWhite:
				Context.fillStyle = '#FFFFFF';
			break;
			
			case ChessboardTileState.TileStateTouchable:
				Context.fillStyle = '#186326';
			break;	
		}
		
		Context.drawImage( Texture, this.Position.X(), this.Position.Y() );
		Context.strokeRect( this.Position.X(), this.Position.Y(), Width, Height );
		
		//	if the tile has been touched draw a 
		//	slightly transparent color over it
		if( this.Touched ) {
			Context.fillStyle = "rgba( 255, 255, 0, .40 );"
			Context.fillRect( this.Position.X(), this.Position.Y(), Width, Height );
		}
		
		//	display the entries in the middle of the tile
		if( this.Entries != null ) {
			Context.font = "bold 14px sans-serif";
			Context.fillStyle = '#00deff';
			Context.fillText( this.Entries, this.Position.X() + 35, this.Position.Y() + 40 );	//	yeah, it's a magic number. So sue me. It's the text offset...
		}
	};
	
	this.CheckEntries = function( Tiles, Recurse ) {
		
		//	check each move and count the 
		//	number of possible entries
		this.Entries = 0;
		
		//	moves
		this.CheckEntryAtPosition( this.TileRow - 2, this.TileColumn - 1, Tiles, Recurse );

		this.CheckEntryAtPosition( this.TileRow - 2, this.TileColumn + 1, Tiles, Recurse );

		this.CheckEntryAtPosition( this.TileRow - 1, this.TileColumn + 2, Tiles, Recurse );

		this.CheckEntryAtPosition( this.TileRow + 1, this.TileColumn + 2, Tiles, Recurse );

		this.CheckEntryAtPosition( this.TileRow + 2, this.TileColumn + 1, Tiles, Recurse );

		this.CheckEntryAtPosition( this.TileRow + 2, this.TileColumn - 1, Tiles, Recurse );

		this.CheckEntryAtPosition( this.TileRow + 1, this.TileColumn - 2, Tiles, Recurse );

		this.CheckEntryAtPosition( this.TileRow - 1, this.TileColumn - 2, Tiles, Recurse );
	};
	
	this.CheckEntryAtPosition = function( Row, Column, Tiles, Recurse ) {
		
		if( Row in Tiles ) {
			if( Column in Tiles[Row] ) {
				EntryTile = Tiles[Row][Column];
				this.CheckEntry( EntryTile, Tiles, Recurse );
			} 
		} 
	};
	
	this.CheckEntry = function( EntryTile, Tiles, Recurse ) {
		if( EntryTile instanceof ChessboardTile ) {
			if( EntryTile.Touched == false ) {
				this.Entries ++;
				if( Recurse )
					EntryTile.CheckEntries( Tiles, false );
			}
		}
	};
};

//	the knight piece
function Knight( StartingPosition ) {
	
	this.Position = StartingPosition;
	var XOffset = 8;
	var YOffset = 8;
	
	var KnightImage = new Image();
	KnightImage.src = '../resources/img/mortal-kombat-knight.png';
	
	this.Draw = function( Context ) {
		
		Context.drawImage( KnightImage, this.Position.X() + XOffset, this.Position.Y() + YOffset );
	};
};

//	a line between tiles
function TileLine( StartingPosition, EndingPosition ) {
	
	this.StartingPosition = StartingPosition;
	this.EndingPosition = EndingPosition;
	this.Offset = Math.floor( ChessboardTileSize.TileWidth / 2 );
	
	this.Draw = function( Context ) {
		
		Context.fillStyle = '#1BA8E0';
		Context.strokeStyle = "#1BA8E0";
		Context.beginPath();
		Context.moveTo( this.StartingPosition.X() + this.Offset, this.StartingPosition.Y() + this.Offset );
		Context.lineTo( this.EndingPosition.X() + this.Offset, this.EndingPosition.Y() + this.Offset );
		Context.stroke();
	};
};

//	the begininning message
function BeginningMessage() {
	
	var Texture = new Image();
	Texture.src = '../resources/img/message-begin.png';
	
	this.Draw = function( Context ) {
		
		Context.drawImage( Texture, 10, 20 );
	};
};

//	the success message
function SuccessMessage() {
	
	var Texture = new Image();
	Texture.src = '../resources/img/message-success.png';
	
	this.Draw = function( Context ) {
		
		Context.drawImage( Texture, 10, 20 );
	};
};

//	particle effect (for testing)
function RandomParticle( Point, Name ) {

	var Radius = Math.floor( Math.random() * 10 ) + 10;
	var Direction = Math.floor( Math.random() * 359 ) + 1;
	var Size = Math.floor( Math.random() * 100 ) + 50;
	var Speed = Math.floor( Math.random() * 25 ) + 1;
	var Alpha = Math.floor( Math.random() ) * 100;
	var ParticleColor = "rgb(" + Math.floor(Math.random(0, 255)*100) + "," + Math.floor(Math.random(0, 255)*100) + "," + Math.floor(Math.random(0, 255)*100) + ")";
	var Position = Point;
	
	this.Draw = function( Context ) {
		
		//	move it
		Position.SetX( Position.X() + ( Math.sin( Direction ) * Speed ) );
		Position.SetY( Position.Y() + ( Math.cos( Direction ) * Speed ) );
		
		//	draw it
		var Gradient = Context.createRadialGradient( Position.X(), Position.Y(), 0, Position.X(), Position.Y(), Radius );
		Gradient.addColorStop( 0, ParticleColor );
		Gradient.addColorStop( 1, 'rgba(255,255,255,0)' );
		Context.fillStyle = Gradient;
		Context.fillRect( Position.X() - Radius, Position.Y() - Radius, Radius * 2, Radius * 2);
		
	};
	
};

//	the jQuery triggered onLoad
$(document).ready(function() {
	
	//	get the canvas
	var Canvas = document.getElementById( 'canvas' );
	
	//	create the stages
	var Stages = [];
	Stages[0] = new Opening();
	
	//	pass the canvas to the MainGame constructor
	var Game = new MainGame( Canvas, MainGameMode.GameModeRelease, Stages );
	
});