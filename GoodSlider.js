/** ѣ
 * GoodSlider 
 * 
 * @author Pavel Sofroniev
 * @license http://www.apache.org/licenses/LICENSE-2.0 Apache License
 * @requires jQuery 1.8 or later
 * @version 0.1.0
 */


var GoodSlider = function(settings) {
	var Slider = {
		
		currently_moving: false, 
		number_of_items: 0, 
		step: 0, 
		positions: [], 
		teleportations: [], 
		unseen_positions_left: 0, 
		unseen_positions_right: 0, 
		
		dom: { 
			arrow_left: false,
			arrow_right: false,
			container: false,
			items: false,
			items_world: false,
			portal: false
		},
		
		settings: {
			animation: {
				duration: 400,
				easing: 'swing'
			},
			automation: {
				interval: false,
				direction: 'to_left'
			},
			callbacks: {
				movement: function() { return; }
			},
			elements: {
				container: '.slider:first',
				items: '.item',
				left_arrow: '.arrow_left',
				right_arrow: '.arrow_right'
			},
			endless: false,
			height: false,
			visible_items: 5
		}, 
		
		init: function(settings) {
			
			// recursive extension
			Slider.settings = $.extend(true, Slider.settings, settings);
			
			// get acquainted with dom
			if(Slider.settings.elements.container instanceof jQuery) {
				Slider.dom.container = Slider.settings.elements.container;
			} else {
				Slider.dom.container = $(Slider.settings.elements.container);
			}
			if(Slider.settings.elements.items instanceof jQuery) {
				Slider.dom.items = Slider.settings.elements.items;
			} else {
				Slider.dom.items = Slider.dom.container.find(Slider.settings.elements.items);
			}
			Slider.dom.items.addClass('good_slider_item');
			Slider.dom.items.wrapAll('<div class="good_slider_items_world" />');
			Slider.dom.items_world = Slider.dom.items.parent('.good_slider_items_world');
			Slider.dom.items_world.wrapAll('<div class="good_slider_portal" />');
			Slider.dom.portal = Slider.dom.items_world.parent('.good_slider_portal');
			
			// basic arithmetics
			Slider.number_of_items = Slider.dom.items.length;
			Slider.unseen_positions_left = 0;
			Slider.unseen_positions_right = Slider.number_of_items - Slider.settings.visible_items;
			
			// prevent an empty portal
			if(Slider.unseen_positions_right < 0) {
				Slider.settings.visible_items = Slider.number_of_items;
				Slider.unseen_positions_right = 0;
			}
			
			// basic geometry
			Slider.step = Slider.dom.items.outerWidth(true);
			
			if(Slider.settings.height) height = Slider.settings.height;
			else height = Slider.dom.items.outerHeight(true) + 'px';
			
			// css tricks
			Slider.dom.items.css({
				'clear': 'none',
				'display': 'block',
				'float': 'left'
			});
			Slider.dom.items_world.css({
				'height': height,
				'left': '0px',
				'position': 'absolute',
				'top': '0px',
				'width': Slider.number_of_items * Slider.step + 'px'
			});
			Slider.dom.portal.css({
				'height': height,
				'margin': '0 auto',
				'overflow': 'hidden',
				'position': 'relative',
				'width': Slider.step * Slider.settings.visible_items + 'px'
			});
			
			// attach event handlers to the arrows
			if(Slider.settings.elements.left_arrow instanceof jQuery) {
				Slider.dom.arrow_left = Slider.settings.elements.left_arrow;
			} else {
				Slider.dom.arrow_left = Slider.dom.container.find(Slider.settings.elements.left_arrow);
			}
			if(Slider.settings.elements.right_arrow instanceof jQuery) {
				Slider.dom.arrow_right = Slider.settings.elements.right_arrow;
			} else {
				Slider.dom.arrow_right = Slider.dom.container.find(Slider.settings.elements.right_arrow);
			}
			Slider.dom.arrow_left.click({direction: 'to_right'}, Slider.event_handlers.move);
			Slider.dom.arrow_right.click({direction: 'to_left'}, Slider.event_handlers.move);
			
			// automatisation
			if(Slider.settings.automation.interval) {
				Slider.automation.start();
			}
		},
		
		event_handlers: {
			move: function(e) {
				e.preventDefault();
				Slider.move(e.data.direction);
			}
		},
		
		move: function(direction) {
			
			// prevent movement build-ups
			if(Slider.currently_moving == true) return;
			Slider.currently_moving = true;
			
			if(Slider.automation.active) {
				Slider.automation.stop();
			}
			
			// our world is one dimension only
			if(direction == 'to_right') {
				
				if(Slider.unseen_positions_left == 0) {
					if(Slider.settings.endless == false) {
						Slider.end_moving();
						return;
					} 
					else {
						Slider.teleportations.push(new Slider.factory.Teleportation('<'));
					}
				}
				else {
					Slider.unseen_positions_left--;
					Slider.unseen_positions_right++;
				}
				movement = '+='+ Slider.step +'px';
			} 
			else {
				if(Slider.unseen_positions_right == 0) {
					if(Slider.settings.endless == false) {
						Slider.end_moving();
						return;
					} 
					else {
						Slider.teleportations.push(new Slider.factory.Teleportation('>'));
					}
				}
				else {
					Slider.unseen_positions_right--;
					Slider.unseen_positions_left++;
				}
				movement = '-='+ Slider.step +'px';
			}
			
			// position hooks
			if(Slider.positions.length > 0) {
				for(i = 0; i < Slider.positions.length; i++) {
					Slider.positions[i].move(direction);
				}
			}
			
			// go animation, go
			Slider.dom.items_world.animate({
				left: movement
			}, {
				duration: Slider.settings.animation.duration,
				easing: Slider.settings.animation.easing,
				complete: Slider.end_moving
			});
			
		}, 
		
		end_moving: function() {
			
			while(Slider.teleportations.length) {
				teleportation = Slider.teleportations.shift();
				teleportation.complete();
				delete teleportation;
			}
			
			Slider.settings.callbacks.movement();
			Slider.currently_moving = false;
			
			if(Slider.settings.automation.interval) {
				Slider.automation.start();
			}
			
		}, 
		
		convert_position_id: function(id) {
			
			// id must be /([LRC]{1}[0-9]+)/i
			letter = id.substr(0, 1).toUpperCase();
			if($.inArray(letter, ['L', 'R', 'C']) == -1) {
				return false;
			}
			number = parseInt(id.substr(1, 1));
			if(isNaN(number)) {
				return false;
			}
			
			// the Cake is a lie
			if(letter == 'C') {
				if(Slider.settings.visible_items % 2 == 0) {
					return false;  // no central point
				}
				
				half = (Slider.settings.visible_items - 1)/2;
				if(number > half) {
					return false;
				}
				
				if(number == 0) {  // the centre
					return [{letter: 'L', number: half + 1}]
				}
				else {
					return [
						{letter: 'L', number: half - number + 1},
						{letter: 'R', number: half - number + 1}
					];
				}
			}
			
			return [{letter: letter, number: number}];
		}, 
		
		add_position: function(id, settings) {
			
			id = Slider.convert_position_id(id);
			if(!id) return false;
			
			for(j = 0; j < id.length; j++) {
				position = new Slider.factory.Position();
				position.init(id[j].letter, id[j].number, settings);
				Slider.positions.push(position);
			}
			
			return true;
		}, 
		
		remove_position: function(id) {
			
			if(Slider.positions.length <= 0) return false;
			
			id = Slider.convert_position_id(id);
			if(!id) return false;
			
			$flag = false;
			for(j = 0; j < id.length; j++) {
				for(i = 0; i < Slider.positions.length; i++) {
					if(Slider.positions[i].from == id[j].letter 
					&& Slider.positions[i].distance == id[j].number) {
						Slider.positions.splice(i, 1);
						$flag = true;
					}
				}
			}
			
			if($flag) return true;
			else return false;
		}, 
		
		factory: {
			Position: function() {
				var Position = {
					
					from: 'L',  // L or R
					distance: 1,  // 0 is already invisible
					dom: false, 
					
					settings: {
						css_class: ''
					}, 
					
					init: function(from, distance, settings) {
						
						Position.from = from;
						Position.distance = distance;
						Position.settings = $.extend(Position.settings, settings);
						
						if(Position.from == 'L') {
							index = Slider.unseen_positions_left + Position.distance;
							index--;  // eq() starts counting from 0
							Position.dom = Slider.dom.items.eq(index);
						}
						else if(Position.from == 'R') {
							index = Slider.unseen_positions_right + Position.distance;
							Position.dom = Slider.dom.items.eq(-index);
						}
						
						Position.dom.addClass(Position.settings.css_class);
					}, 
					
					move: function(direction) {
						if(direction == 'to_right') {
							Position.dom.removeClass(Position.settings.css_class);
							Position.dom = Position.dom.prev();
							Position.dom.addClass(Position.settings.css_class);
						}
						else {
							Position.dom.removeClass(Position.settings.css_class);
							Position.dom = Position.dom.next();
							Position.dom.addClass(Position.settings.css_class);
						}
					}
					
				}
				return Position;
			}, 
			
			Teleportation: function(direction) {
				Teleportation = {
					
					direction: false, 
					dom: {
						source: false, 
						target: false
					}, 
					
					init: function(direction) {
						Teleportation.direction = direction;
						if(Teleportation.direction == '<') {
							Teleportation.dom.source = Slider.dom.items_world.children(':last');
							Teleportation.dom.target = Teleportation.dom.source.clone();
							Slider.dom.items_world.prepend(Teleportation.dom.target).css({
								left: '-='+Slider.step+'px',
								width: '+='+Slider.step+'px'
							});
						}
						else if(Teleportation.direction == '>') {
							Teleportation.dom.source = Slider.dom.items_world.children(':first');
							Teleportation.dom.target = Teleportation.dom.source.clone();
							Slider.dom.items_world.append(Teleportation.dom.target).css({
								width: '+='+Slider.step+'px'
							});
						}
						Teleportation.dom.source.removeClass('good_slider_item');
						Teleportation.dom.target.addClass('good_slider_item');
						Slider.dom.items = Slider.dom.container.find('.good_slider_item');
					}, 
					
					complete: function() {
						if(Teleportation.direction == '<') {
							Teleportation.dom.source.remove();
							Slider.dom.items_world.css({
								width: '-='+Slider.step+'px'
							});
						}
						else if(Teleportation.direction == '>') {
							Slider.dom.items_world.css({
								left: '+='+Slider.step+'px',
								width: '-='+Slider.step+'px'
							});
							Teleportation.dom.source.remove();
						}
					}
					
				}
				
				Teleportation.init(direction);
				return Teleportation;
			}
			
		}, 
		
		automation: {
			active: false, 
			
			start: function() {
				interval = Number(Slider.settings.automation.interval);
				if(isNaN(interval)) return;
				
				Slider.automation.active = window.setInterval(function() {
					Slider.move(Slider.settings.automation.direction);
				}, interval);
			}, 
			
			stop: function() {
				window.clearInterval(Slider.automation.active);
			}
		}, 
		
		die: function() {
			if(Slider.automation.active) Slider.automation.stop();
			Slider.dom.arrow_left.unbind('click', Slider.event_handlers.move);
			Slider.dom.arrow_right.unbind('click', Slider.event_handlers.move);
			Slider.dom.items.unwrap().unwrap();
		}
		
	}
	
	Slider.init(settings);
	return Slider;
}
