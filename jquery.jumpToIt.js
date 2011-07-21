//polyfill for Object.create
(function( w ) {
    function F(){}
    if ( !w.Object.create ) {
        w.Object.create = function( o ){
            F.prototype = o;
            return new F();
        };
    }
})( window );

//pluginator
(function( $ ){
    $.plugin = function( name, object ) {
        $.fn[name] = function( options ) {
            // optionally, you could test if options was a string
            // and use it to call a method name on the plugin instance.
            return this.each(function() {
                if ( ! $.data( this, name ) ) {
                    $.data( this, name, Object.create( object ).init( options, this ) );
                }
            });
        };
    };
})( jQuery );


//jQuery plugin
(function( $ ){
    var JumpToIt = (function(){
        var opts = {
            nextKey: 74, //j - TODO: translate into actual letter for use in help?
            prevKey: 75, //k
            startOnIdx: 0,
            selItems: ".post",
            helpId: "hkHelp",
            helpClass: "info",
            activeClass: "active",
            hotkeyClass: "hotkey",
            itemNavClass: "nav",
            prevBtnClass: "prev",
            nextBtnClass: "next",
            useScrolling: true,
            scrollSpeed: 500,
            useHelp: true,
            useItemNav: true,
            onChange: $.noop,
            onEnd: $.noop
        },
            
        //helper: initialize and go!
        init = function( opts, elem ){
            var self = this,
                $this = $( elem ),
                selector = elem.tagName + "#" + elem.id + "." + elem.className; //ick!

            //extend default settings
            $.extend( this.opts, opts );
            
            //cache main jquery collection & selector
            this.$parent = $this;
            this.selector = selector; //TODO: better way? trying to keep track of orig sel
                
            //collect item ids & set initial index
            this.getItemIds();
            this.currIdx = this.opts.startOnIdx;
            
            //inject item nav & help html if neeeded
            if ( this.opts.useHelp && !this.hasHelp ) {
                this.buildHelp();
            }
            if ( this.opts.useItemNav && !this.hasNav ) {
                this.buildItemNav();
            }
            
            //attach hotkey listener
            $this.delegate( this.opts.selItems, "keydown.jumpToIt", function( e ){
                var opts = self.opts,
                    inc;
                
                //filter for hotkeys and increment target post
                switch ( e.keyCode ) {
                    case opts.nextKey:
                        inc = 1;
                        break;
                    case opts.prevKey:
                        inc = -1;
                        break;
                    default:
                        return false;
                }        
                self.tick( self.currIdx + inc );
            });
            
            //set active state on post when clicked
            $this.delegate( this.opts.selItems, "click.jumpToIt", function( e ){
                self.tick( self.itemIds.indexOf( this.id ) );
            });
            
            //maintain the chain!
            return this;
        },
            
        //helper: test for list boundary
        setIndex = function( idx, length ){
            if ( idx < 0 ) {
                return length - 1;
            } else if ( length > idx && idx > 0 ) {
                return idx;
            }
            return 0;
        },
            
        //helper: build & append item nav html
        buildItemNav = function(){
            var self = this,
                opts = this.opts, //local lookup = faster?
                $parent = this.$parent,
                $items = this.$parent.children( opts.selItems );
                
            //TODO: Use template e.g. script type="application/json"
            postNavHtml = '<div class="' + opts.itemNavClass + '">'
                        + '<a class="' + opts.prevBtnClass + '" href="#prev">prev</a>'
                        + '<a class="' + opts.nextBtnClass + '" href="#next">next</a>'
                        + '</div>';
            
            $items.append( postNavHtml );
            
            //event listeners for next / prev buttons
            $parent.delegate( "." + opts.nextBtnClass, "click.jumpToIt", function(e){
                self.tick( self.currIdx + 1 );
                return false;
            });
            $parent.delegate( "." + opts.prevBtnClass, "click.jumpToIt", function(e){
                self.tick( self.currIdx - 1 );
                return false;
            });
        },
            
        //helper: build & append help html
        buildHelp = function(){
            var opts = this.opts,
                //TODO: Use template
                helpHtml = '<div id="' + opts.helpId + '" class="' + opts.helpClass
                         + '">Press <span class="' + opts.hotkeyClass
                         + '">j</span> for next, <span class="' + opts.hotkeyClass
                         + '">k</span> for previous</div>';
            
            $( "body" ).append( helpHtml );
            this.hasHelp = true;
        },
            
        //helper: fades in / out help widget
        showHelp = function(){ 
            var self = this,
                $help = $( "#" + this.opts.helpId );
            
            //fade in help widget
            $help.fadeIn("fast", function(){
                
                //check if help is already showing and reset timer if so
                if ( self.timer ) {
                    window.clearTimeout( self.timer );
                }
                
                //fade out help widget
                self.timer = window.setTimeout( function(){
                    $help.fadeOut( "slow" );
                }, 2000);
            });
        },
            
        //helper: scroll to an item
        scrollTo = function( top ){
            var $item = $( "#" + this.itemIds[ this.currIdx ] ),
                topMargin = ( $item.outerHeight( true ) - $item.outerHeight() ) / 2;
            
            top = top || $item.offset().top - topMargin;
            
            //TODO: for the love of pete... why won't ie use body??!
            //TODO: cache selector?
            //TODO: cancel if another request comes in (avoid key repeate crappery) 
            $( "html, body" ).animate({
                scrollTop: top
            }, this.opts.scrollSpeed );
        },
            
        //helper: collect item ids, set tabindex attr to enable focus-ability
        getItemIds = function(){
            var self = this;
            
            this.itemIds = [];
            
            this.$parent
                .children( this.opts.selItems )
                .attr( "tabindex", 99999 )
                .each(function(){
                    self.itemIds.push( this.id );
            });
        },
            
        //helper: increment index
        tick = function( val ){
            var itemIds = this.itemIds,
                currIdx = this.currIdx,
                opts = this.opts,
                nextIdx = this.setIndex( val, itemIds.length ),
                isEnd = currIdx === ( itemIds.length -1 ) && nextIdx === 0 ? true : false;
            
            //fire onEnd callback and break if desired
            if ( isEnd && opts.onEnd() === false ) {
                return false;
            }
   
            //show help if enabled
            if ( opts.useHelp ) {
                this.showHelp();
            }
            
            //turn off active state for previous post item
            $( "#" + itemIds[ currIdx ] ).removeClass( opts.activeClass );
            
            //fire onChange callback and break if desired
            if ( opts.onChange( nextIdx, itemIds ) === false ) {
                return false;
            }
            
            //set and store new index - TODO: better way to set both local and obj idx?
            this.currIdx = nextIdx;
            currIdx = nextIdx;

            //turn on active state for current post item
            $( "#" + itemIds[ currIdx ] ).addClass( opts.activeClass );
            
            //jump to selected post
            if ( opts.useScrolling ) {
                this.scrollTo();
            } else {
                window.location.href = "#" + itemIds[ currIdx ];
            }
        },
            
        //helper: Remove and cleanup
        destroy = function(){
            var opts = this.opts,
                $parent = this.$parent,
                $items = this.$parent.children( opts.selItems ),
                $navs = $( this.selector + " ." + opts.itemNavClass ),
                $help = $( "#" + this.opts.helpId );
            
            $parent.undelegate( ".jumpToIt" );
            $items.removeClass( opts.activeClass );

            if ( opts.useItemNav ){
                $navs.remove();
            }
            if ( opts.useHelp ){
                $help.remove();
            }
        };


        //TODO: order logically!
        return {
            opts: opts,
            //itemIds: [], //target ids 
            //currIdx: 0, //used to increment postIds ex: postIds[currIdx]
            showHelp: showHelp,
            buildItemNav: buildItemNav, //item nav html
            buildHelp: buildHelp, //help html
            getItemIds: getItemIds,
            setIndex: setIndex,
            scrollTo: scrollTo,
            tick: tick,
            destroy: destroy,
            init: init
        }
    })();
    
    //set plugin name
    $.fn.jumpToIt = function ( options ) {
        var selctor = this.selector;

        // loop thru jquery collection unless empty
        if ( this.length ) {
            return this.each( function(){
                var my = Object.create( JumpToIt );
                my.init( options, this );
                
                //store the obj instance for recall later
                $.data(this, "jumpr", my);
            });
        }
    };
})( jQuery );

//usage
$( document ).ready(function(){
    function onChng( nxt, items ){
        console.log( "change!" );
        console.log( nxt );
        console.log( items)
    }
    function onEnd(){
        console.log( "end!" );
    }
    
    $("#list").jumpToIt({
        useHelp: true,
        useScrolling: true,
        onChange: onChng,
        onEnd: onEnd
    }).parent().css( "background", "#eee" );
    
    $( "#list2" ).jumpToIt();

    var posts = $( "#list2" ).data( "jumpr" );
        
    setTimeout(function(){
        posts.destroy();
        $( "#list2" ).jumpToIt();
    }, 10000);
});
