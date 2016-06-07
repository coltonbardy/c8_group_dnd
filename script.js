/**
 * Created by thomascase on 6/2/16.
 */
function Tile(x_coord, y_coord, dom_element){
    //Contains information about a single tile in an area.
    //Contains methods to make make itself active.
    //Contains a reference to its dom_element in the display area
    var self = this;
    self.x_coord=x_coord;
    self.y_coord=y_coord;
    self.dom_element = dom_element;
    self.occupied = false;
    self.occupant = null;
    self.in_range = false;
    self.steps_when_visited = -1;
    self.mini_dom_element = this.dom_element.clone();
    self.neighbors = [];
}
Tile.prototype.make_active = function(){
    $(this.dom_element).addClass('active');
};
Tile.prototype.remove_active = function(){
    $(this.dom_element).removeClass('active');
};
Tile.prototype.mark_in_range = function(num, actor){
    this.in_range = true;
    this.steps_when_visited = num;
    $(this.dom_element).addClass('valid');
    actor.tiles_in_range.push(this);
};
Tile.prototype.clear_path = function(){
    this.in_range = false;
    this.steps_when_visited = -1;
    $(this.dom_element).removeClass('valid');
};
function Area(container){
    //Contains a collection of tiles representing a room, a dungeon, world map, etc.
    //Contains methods to create new tiles, create new actors, select tiles, and select actors.
    var self = this;
    self.parent_area = null;
    self.row_width = 10;
    self.column_height = 10;
    self.tile_grid = [];
    self.active_x_coord = 0;
    self.active_y_coord = 0;
    self.actor_array = [];
    self.selected_actor = null;
    self.container = container;
    for (var i = 0; i < self.row_width; i++){
        self.tile_grid[i] = [];
    }
}
Area.prototype.select_actor = function(actor){
    console.log(actor);
    this.selected_actor = actor;
    console.log("actor: ", this.selected_actor);
    $(this.selected_actor.occupied_tile.dom_element).addClass('selected');
    actor.start_find_path();
};
Area.prototype.deselect_actor = function(){
    $(this.selected_actor.occupied_tile.dom_element).removeClass('selected');
    this.selected_actor.clear_find_path();
    this.selected_actor = null;
};
Area.prototype.move_actor = function(actor, new_x, new_y){
    if(actor.move_to(new_x, new_y)){
        this.deselect_actor();
    }
    
};
Area.prototype.generate_actor = function(x, y, hostile){
    var new_actor = new Actor(this);
    new_actor.parent_area = this;
    new_actor.x_coord=x;
    new_actor.y_coord=y;
    new_actor.occupied_tile = this.tile_grid[x][y];
    console.log('whats going on', this.tile_grid[x][y]);
    new_actor.occupied_tile.occupant = new_actor;
    $(new_actor.occupied_tile.dom_element).addClass('occupied');
    $(new_actor.occupied_tile.mini_dom_element).addClass('occupied');
    if(new_actor.hostile){
        $(new_actor.occupied_tile.dom_element).addClass('hostile');
        $(new_actor.occupied_tile.mini_dom_element).addClass('hostile');
    }
    // new_actor.move_to(x,y);
    if(hostile){
        new_actor.make_hostile();
    }
    this.actor_array.push(new_actor);
};
Area.prototype.build_tile = function(x, y, tile){
    this.tile_grid[x][y] = new Tile(x, y, tile);
    this.container.append(tile);
};
Area.prototype.add_tile_neighbors = function(x, y){
    var current_tile = this.tile_grid[x][y];
    if(this.in_bounds(x-1, y)){
        current_tile.neighbors.push(this.tile_grid[x-1][y]);
    }
    if(this.in_bounds(x, y-1)){
        current_tile.neighbors.push(this.tile_grid[x][y-1]);
    }
    if(this.in_bounds(x+1, y)){
        current_tile.neighbors.push(this.tile_grid[x+1][y]);
    }
    if(this.in_bounds(x, y+1)){
        current_tile.neighbors.push(this.tile_grid[x][y+1]);
    }
    else{}
};
Area.prototype.build_grid = function(){
    console.log(this.container);
    for (var y_coord = 0; y_coord < this.column_height; y_coord++){
        for (var x_coord = 0; x_coord < this.row_width; x_coord++){
            var tile = $("<div>").addClass('tile').css({
                top: y_coord*60,
                left: x_coord*60
            });
            // tile.text(x_coord + ' '+ y_coord);
            this.build_tile(x_coord, y_coord, tile);
        }
    }
    this.tile_grid[this.active_x_coord][this.active_y_coord].make_active();
    for (var y_coord = 0; y_coord < this.column_height; y_coord++){
        for (var x_coord = 0; x_coord < this.row_width; x_coord++) {
            this.add_tile_neighbors(x_coord, y_coord);
        }
    }
    console.log(this);
};
Area.prototype.give_child_info = function(child_area){
    child_area.tile_grid = this.tile_grid;
    child_area.row_width = this.row_width;
    child_area.column_height = this.column_height;
    child_area.parent_area = this;
};
Area.prototype.in_bounds = function (x_coord, y_coord){
    console.log('checking bounds');
    var success = !(x_coord < 0 || y_coord < 0 || x_coord >= this.row_width || y_coord >= this.column_height);
    console.log(success);
    return success;
};
Area.prototype.make_move = function(new_x, new_y){
    this.tile_grid[this.active_x_coord][this.active_y_coord].remove_active();
    this.tile_grid[new_x][new_y].make_active();
    this.active_x_coord=new_x; this.active_y_coord=new_y;
};
Area.prototype.key_pressed = function (key_num){
    console.log('key pressed: ' + key_num);
    var x = this.active_x_coord;
    var y = this.active_y_coord;
    switch (key_num){
        case 119:
            if (this.in_bounds(x, y-1)){
                this.make_move(x, y-1);
            }
            break;
        case 97:
            //move left
            if (this.in_bounds(x-1, y)){
                this.make_move(x-1, y);
            }
            break;
        case 115:
            //move down
            if (this.in_bounds(x, y+1)) {
                this.make_move(x, y + 1);
            }
            break;
        case 100:
            //move right
            if (this.in_bounds(x+1, y)) {
                this.make_move(x + 1, y);
            }
            break;
        case 32:
            console.log(this.selected_actor);
            if(this.selected_actor == null){
                if(this.tile_grid[x][y].occupant == null){
                    break;
                }
                console.log(this.tile_grid[x][y].occupant);
                this.select_actor(this.tile_grid[x][y].occupant);
            }
            else{
                this.move_actor(this.selected_actor, x, y);
            }
            break;
        default:
            console.log('no bueno');
    }
};
Area.prototype.bind_to_area = function(area){
    this.parent_area = area;
    area.give_child_info(this);
};
Area.prototype.append_tiles = function(){
    console.log('appending');
    for (var y_coord = 0; y_coord < this.column_height; y_coord++){
        for (var x_coord = 0; x_coord < this.row_width; x_coord++){
            $(this.container).append(this.tile_grid[y_coord][x_coord].mini_dom_element.css({
                top: 15*x_coord,
                left: 15*y_coord,
                height: 15,
                width: 15,
            }));
        }
    }
};
function Actor(parent_area){ //actor class representing a person or environmental obstacle
    var self = this;
    self.x_coord = null;
    self.y_coord = null;
    self.current_hitpoints = null;
    self.max_hitpoints = null;
    self.parent_area = parent_area;
    self.occupied_tile = null;
    self.hostile = false;
    self.tiles_in_range = [];
}
Actor.prototype.leave_tile = function(){ //
    // input: none
    // output: The actor is no longer an occupant of any tile
    // $(this.occupied_tile).removeClass('occupied');
    this.clear_find_path();
    this.occupied_tile.occupant = null;
    $(this.occupied_tile.dom_element).removeClass('selected');
    (this.occupied_tile.dom_element).removeClass('hostile');
    (this.occupied_tile.mini_dom_element).removeClass('hostile');
    this.occupied_tile = null;
    $(this.parent_area.tile_grid[this.x_coord][this.y_coord].dom_element).removeClass('occupied');
    $(this.parent_area.tile_grid[this.x_coord][this.y_coord].mini_dom_element).removeClass('occupied');
    this.x_coord = null;
    this.y_coord = null;
};
Actor.prototype.make_hostile = function(){
    this.hostile = true;
    console.log(this);
    console.log(this.occupied_tile);
    this.occupied_tile.dom_element.addClass("hostile");
    this.occupied_tile.mini_dom_element.addClass("hostile");
};
Actor.prototype.move_to = function(new_x, new_y){
    // input: none
    // output: the actor becomes an occupant of the tile at position [new_x][new_y]
    if(this.parent_area.tile_grid[new_x][new_y].occupant != null){
        if(this.parent_area.tile_grid[new_x][new_y].occupant == this){
            console.log('deselecting, changing nothing else');
            return true;
        }
        console.log("ERR: Tile is occupied");
        // this.parent_area.selected_actor = null;
        // $(this.occupied_tile.dom_element).removeClass('selected');
        return false;
    }
    else if(!this.parent_area.tile_grid[new_x][new_y].in_range){
        return false;
    }
    //here check to see if the tile is a valid option for movement pased on pathfinding.
    console.log('moving to: ', new_x, new_y);
    if(this.occupied_tile != null) {
        this.leave_tile();
    }

    this.x_coord=new_x;
    this.y_coord=new_y;
    this.occupied_tile = this.parent_area.tile_grid[new_x][new_y];
    console.log('wtf');
    console.log(this);
    this.occupied_tile.occupant = this;
    $(this.occupied_tile.dom_element).addClass('occupied');
    $(this.occupied_tile.mini_dom_element).addClass('occupied');
    if(this.hostile){
        $(this.occupied_tile.dom_element).addClass('hostile');
        $(this.occupied_tile.mini_dom_element).addClass('hostile');
    }
    return true;
};
Actor.prototype.lose_hitpoints = function(num){
    // input: num, number of hitpoints to lose
    // output: The actor loses hitpoints and, if health is 0 or below, dies
    this.current_hitpoints -= num;
    if(this.current_hitpoints <= 0){
        //die here
    }
};
Actor.prototype.gain_hitpoints= function(num){
    // input: num, number of hitpoints to gain
    // output: The actor gains hitpoints but cannot exceed its maximum hitpoints
    this.current_hitpoints += num;
    if(this.current_hitpoints > this.max_hitpoints){
        this.current_hitpoints = this.max_hitpoints;
    }
};

$(document).ready(function(){
    var main_container = $("#grid-container");
    var main_area = new Area(main_container);
    main_area.build_grid();
    var minimap_dom = $(".minimap");
    var minimap = new Area(minimap_dom);
    minimap.bind_to_area(main_area);
    minimap.append_tiles();
    $(document).keypress(function(e){
        main_area.key_pressed(e.which);
        e.preventDefault();
    });
    main_area.generate_actor(4,5, false);
    main_area.generate_actor(1,0, true);
    console.log(main_area.tile_grid);
    var my_actor = main_area.actor_array[0];
});