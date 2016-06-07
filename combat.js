/**
 * Created by thomascase on 6/6/16.
 */

Actor.prototype.start_find_path = function(){
    for (var i = 0; i < this.occupied_tile.neighbors.length; i++){
        find_path(this.occupied_tile.neighbors[i], 3, this);
    }
};
Actor.prototype.clear_find_path = function(){
    for (var i = 0; i < this.tiles_in_range.length; i++){
        this.tiles_in_range[i].clear_path();
    }
};
function find_path (starting_tile, steps_remaining, actor){
    if (steps_remaining === 0 || starting_tile.occupant != null){
            return;
    }
    starting_tile.mark_in_range(steps_remaining, actor);
    var neighbors = starting_tile.neighbors;
    console.log(neighbors.length);
    for (var i = 0; i < neighbors.length; i++){
        var neighbor = neighbors[i];
        // console.log('checking neighbor: ' + neighbor.in_range);
        if(!neighbor.occupied && neighbor.steps_when_visited < steps_remaining){
            find_path(neighbor, steps_remaining - 1, actor);
        }
    }
};