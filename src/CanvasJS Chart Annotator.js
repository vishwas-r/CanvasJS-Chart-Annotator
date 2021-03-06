(function () {
	var CanvasJS = window.CanvasJS || CanvasJS ? window.CanvasJS : null;

	if (CanvasJS) {
		CanvasJS.Chart.prototype._updateUserCustomOptions = function () {
			this.annotations.enabled = this.options && this.options.annotations && typeof(this.options.annotations.enabled) !== "undefined" ? this.options.annotations.enabled : false;
			this.annotations.showToolbar = this.options && this.options.annotations && typeof(this.options.annotations.showToolbar) !== "undefined" ? this.options.annotations.showToolbar : true;
			
			this.annotations.tools = this.options && this.options.annotations && this.options.annotations.tools ? this.options.annotations.tools : { text: true, pencil: true, eraser: true };
			this.annotations.text = this.options && this.options.annotations && this.options.annotations.text ? this.options.annotations.text : {};
			this.annotations.pencil = this.options && this.options.annotations && this.options.annotations.pencil ? this.options.annotations.pencil : {};
			this.annotations.eraser = this.options && this.options.annotations && this.options.annotations.eraser ? this.options.annotations.eraser : {};
			this.annotations.tools.reset = true;

			this.annotations.lines = this.options && this.options.annotations && this.options.annotations.lines ? this.options.annotations.lines : [];			
			for(var i = 0; i < this.annotations.lines.length; i++) {
				this.annotations.lines[i].thickness = this.annotations.lines[i].thickness ? this.annotations.lines[i].thickness : 1; 
				this.annotations.lines[i].color = this.annotations.lines[i].color ? this.annotations.lines[i].color : "#000"; 
			}
			
			this.annotations.text.fontSize = this.annotations.text.fontSize ? this.annotations.text.fontSize : 12;
			this.annotations.text.fontFamily = this.annotations.text.fontFamily ? this.annotations.text.fontFamily : "Calibri";
			this.annotations.text.fontWeight = this.annotations.text.fontWeight ? this.annotations.text.fontWeight : "normal";
			this.annotations.text.fontColor = this.annotations.text.fontColor ? this.annotations.text.fontColor : "black";
			this.annotations.text.fontStyle = this.annotations.text.fontStyle ? this.annotations.text.fontStyle : "normal";
			this.annotations.text.borderThickness = this.annotations.text.borderThickness ? this.annotations.text.borderThickness : 1;
			this.annotations.text.borderColor = this.annotations.text.borderColor ? this.annotations.text.borderColor : "black";
			this.annotations.text.backgroundColor = this.annotations.text.backgroundColor ? this.annotations.text.backgroundColor : "white";
			this.annotations.text.margin = this.annotations.text.margin ? this.annotations.text.margin : 5;
			
			this.annotations.pencil.color = this.annotations.pencil.color ? this.annotations.pencil.color : "#000";
			this.annotations.pencil.lineThickness = this.annotations.pencil.lineThickness ? this.annotations.pencil.lineThickness : 1;
			this.annotations.eraser.thickness = this.annotations.eraser.thickness ? this.annotations.eraser.thickness : 10;
		}

		CanvasJS.Chart.prototype.addAnnotations = function () {
			
			this.annotations = {};

			this._updateUserCustomOptions();

			if(!this.annotations.enabled)
				return;
			
			var overlaidCanvas = this.overlaidCanvas, _this = this;
			this.userCanvas = document.createElement('canvas');
			this.userCanvas.setAttribute("class", "canvasjs-chart-user-canvas");

			this.userCanvas.width = this.width;
			this.userCanvas.height = this.height;

			this.userCanvas.style.position = "absolute";
			this.userCanvas.style.userSelect = "none";
			this._canvasJSContainer.insertBefore(this.userCanvas, this.overlaidCanvas);

			this.userCanvasCtx = this.userCanvas.getContext('2d');

			if (!this.drawingTools && this.annotations.showToolbar)
				this.drawingTools = this.createDrawingToolbar();
			
			for(var i = 0; i < this.annotations.lines.length; i++) {
				drawLine(this.userCanvasCtx, this.annotations.lines[i]);
			}
			
			this.annotations._line = {};
			overlaidCanvas.addEventListener('mousedown', function (e) {
				var xy = getMouseCoordinates(e), tool;

				for (var j = 0; j < _this.drawingTools.length; j++) {
					tool = _this.drawingTools[j];
					switch (tool.name) {
						case "text":
							if (tool.button.value === "on") {
								var value = prompt("Enter the Text");
								renderCustomText(_this.userCanvasCtx, value, xy.x, xy.y);
							}
							break;
						case "pencil":
							if(tool.button.value === "on") {
								_this.annotations._drawingLines = true;
								_this.annotations._line.point = xy;
							}
							break;
						case "eraser":
							if(tool.button.value === "on") {
								_this.annotations._erase = true;
								_this.annotations._line.point = xy;
							}
							break;
					}

				}

			}, false);

			overlaidCanvas.addEventListener('mousemove', function (e) {
				if(_this.drawingTools) {
					for (var j = 0; j < _this.drawingTools.length; j++) {
						tool = _this.drawingTools[j];
						switch (tool.name) {
							case "text":
								if (tool.button.value === "on") {
									this.style.cursor = "text";
								}
								break;
							case "pencil":
							case "eraser":
								if (tool.button.value === "on") {
									this.style.cursor = "crosshair";
								}
								break;
						}

					}
				}
				
				if(_this.annotations._drawingLines) {
					_this.userCanvasCtx.beginPath(); 
					
					_this.userCanvasCtx.lineWidth = _this.annotations.pencil.lineThickness;
					_this.userCanvasCtx.lineCap = 'round';
					_this.userCanvasCtx.strokeStyle = _this.annotations.pencil.color;
					
					_this.userCanvasCtx.moveTo(_this.annotations._line.point.x, _this.annotations._line.point.y);
					_this.annotations._line.point = getMouseCoordinates(e);
					_this.userCanvasCtx.lineTo(_this.annotations._line.point.x, _this.annotations._line.point.y);
					_this.userCanvasCtx.stroke();
					
					_this.userCanvasCtx.closePath();
				}
				
				if(_this.annotations._erase) {
					_this.userCanvasCtx.beginPath(); 
					
					_this.userCanvasCtx.lineWidth = _this.annotations.eraser.thickness;
					_this.userCanvasCtx.globalCompositeOperation = "destination-out";
					_this.userCanvasCtx.strokeStyle = "rgba(0,0,0,1)";
					_this.userCanvasCtx.moveTo(_this.annotations._line.point.x, _this.annotations._line.point.y);
					_this.annotations._line.point = getMouseCoordinates(e);
					_this.userCanvasCtx.lineTo(_this.annotations._line.point.x, _this.annotations._line.point.y);
					_this.userCanvasCtx.stroke();
					
					_this.userCanvasCtx.closePath();
					_this.userCanvasCtx.globalCompositeOperation = "source-over";
				}
			}, false);

			overlaidCanvas.addEventListener('mouseup', function (e) {
				_this.annotations._drawingLines = false;
				_this.annotations._erase = false;
			}, false);

			function getMouseCoordinates(ev) {
				var x = 0;
				var y = 0;

				ev = ev || window.event;

				if (ev.offsetX || ev.offsetX === 0) {
					x = ev.offsetX;
					y = ev.offsetY;
				} else if (ev.layerX || ev.layerX == 0) { // Firefox
					x = ev.layerX;
					y = ev.layerY;
				}
				else {
					x = ev.pageX - ev.target.offsetLeft;
					y = ev.pageY - ev.target.offsetTop;
				}

				return { x: x, y: y };
			};

			function renderCustomText(ctx, txt, x, y) {
				if(!txt)
					return;
				
				ctx.font = getFontString(_this.annotations.text);
				ctx.textBaseline = "top";

				var margin = _this.annotations.text.margin,
					width = ctx.measureText(txt).width,
					height = _this.annotations.text.fontSize + margin + _this.annotations.text.borderThickness;

				ctx.fillStyle = _this.annotations.text.backgroundColor;
				ctx.fillRect(x - width / 2 - margin / 2, y - height / 2, width + margin, _this.annotations.text.fontSize + margin);

				ctx.lineWidth = _this.annotations.text.borderThickness;
				ctx.strokeStyle = _this.annotations.text.borderColor;

				ctx.strokeRect(x - width / 2 - margin / 2, y - height / 2, width + margin, _this.annotations.text.fontSize + margin);

				ctx.fillStyle = _this.annotations.text.fontColor;
				ctx.fillText(txt, x - width / 2, y - height / 2 + margin / 2);
			}
			
			function getFontString(object) {
				var fontString = "";
				fontString += ((object["fontStyle"] ? object["fontStyle"] : "normal") + " " + (object["fontSize"] ? object["fontSize"] : "12") + "px " + (object["fontFamily"] ? object["fontFamily"] : "Arial"));
				return fontString;
			}
			
			function drawLine(ctx, line){
				var lineOffset = line.thickness % 2 === 1 ? 0.5 : 0
				ctx.lineWidth = line.thickness;
				ctx.strokeStyle = line.color;
				
				ctx.beginPath();
				ctx.moveTo(line.coordinates.x1, line.coordinates.y1 + lineOffset);
				ctx.lineTo(line.coordinates.x2, line.coordinates.y2 + lineOffset);
				ctx.stroke();
			}
		}

		CanvasJS.Chart.prototype.clearUserCanvas = function () {
			this.userCanvasCtx.clearRect(0, 0, this.width, this.height);
		}

		CanvasJS.Chart.prototype.createDrawingToolbar = function () {
			var _this = this, drawingTool, tools = [], names = [];

			this._base64Images = {
				"text": " data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAsQAAALEBxi1JjQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAGgSURBVEiJ7dY/axRBGAbwn7rkhChRESstRBQrCxtTHIKFjb2VVa66D2OngpWdKfQj2NmlEcUgGNEUgnCGQ0MS7y7ExGLeJcuys3qHjeADy75/Zp5nZgeeWfiAg8ozwQ3TYzHmVrnWjkTwFC9j4C6e4ceUAvO4i7nIb+KeEOjPsOLfoY+DoqFxDedmJB3gbbVQSJ9kEvkpvMKxGQV+4iy+B+ekkL5VqXo8yPt4MSX5bTwODtI5viuw0jB4gC/o4WTUtvEk4h5ORLwV9UGNYwcrTWdQootHtdrHeD+s1ddyJDmBSw7P5SL28Lk2/kLk67iKzp8IjILsfuT70lYbJ0dvHw8i3wuOrMAmruBM5N+wgfMZgQ1cxunIh8GRFSBteT1D2IRPbc2jUxDNhP8C/4bAHBYa6gsOvb9VYFG6LHJ4g9WIRxhHvIrXLfPmg9sESy0Dh1jGHclpi4iXo5fDEsaFtM2cFZQYSffGrch31SyhAR102ty0xFCy515DL+uiJUqBrmRa5eqeS0YG1+Wv0K+VuH7pd6urqP5qjP2935b3vwBJnGW4rxSStgAAAABJRU5ErkJggg==",
				"pencil": " data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAtQAAALUBOdDOnwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAIUSURBVEiJpdW7alRRFMbx3x6SSSZ3wUJIXiGNhZWFooFcC8V38AkEXyGFYCFWBsTCUouoGWJu3hGbgBAlWkYRC4kmhWJkW8yeeHI4Y2YyG04x6+z9/9ZZ31p7xBi18+AYbuAzbmE4+76kjRVCGMJjDGMaJayFEEb2N7WR+SDe4B46UizgJj5gJMZ4NAEM4DUW0Zl7lxUZDinYSln6E3gQx3Euxvg2tydgruUSoR8vMI8yruIrRgv2nsSnVuB9eIaHKGfid/Ii6MB9XG8W3ounWEBXJj6DnawIOpPxrzDQDLwHa6jm4NMJPpN+18u1iJcYOLSLUMFKOtSdg//AdCZWxgaeo38/fgh8KT2VTHyqAXw+edR3gNMA3p2yXm4An8rEupLxT/LwQoF0oIpV9GTik/heAF9IHvUWJlsAf5Q/gIkEn8x9ZTV51FMEPyCQ6vggtWMRfCLnT72EDeF5gbuIyaixFBvHdgF8Se0WrfwPvi+AIfzGZVzDZjJ0G+O5mVhO2R8KzwpcwnpmzD9iL2dobzK+mp2JZgXmMJuBnUkimxhL8LXUAF3NwmOMQoxRCGFLbezPxhi/QAihA7M4lbzZwcUY4y8trFIIYdS/P5DVEMIJiDHupS84nbroQqvw+rqidvuVcBvvUubr+Kl2U5ZbKcuBEql1xS7+4Dy+qU3nAlZijLtHybq+At5jqw6NMW60A8yvv3JDcQuKPJ4gAAAAAElFTkSuQmCC",
				"eraser": "  data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAsQAAALEBxi1JjQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFZSURBVEiJrdW9ShxRAIbhxwQ3rOQCLO0CuYaAnZDKRiv/CAtiEbAwlZ02YgqttFEREQsbQ5LODRZJIdpEMaWFjd5A2sW1mDMwKzPj/OzXnW8O7zvnzJkZqmUGv3GHHxivyEnNKrr4i33chvHXfsJ38Cp0DWyFfqMOfCVA9hLwZNbC9c0q8LQ7f4/JZ/M2VFhJGhy+hH45Q7JeBw6vcZgh2Q79WFX4S5I3uMdBHXia5GOi/4mLuvCkZB7DYfwWDzjuB/x5mmijgw9p8K7oU1AX3sOI4bv4FSZM9wve0rstzYRkqi4cbnCud8/LSHLh8F/6l7CIpInTPDhc4k8OIEtSCA6LomewWEJSGE70kpzgEQsFJK0y8DiD+BYkn3MkbdFqO5gtCi8qSZ6W0vA4DXwPkiUMhH7IC0cxKwMpXQNHmMAVrjGKEdEP/qwE/1+aIBbP4RPeBWmVXD8Bt4B5hDdpPgkAAAAASUVORK5CYII=",
				"reset": " data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAsQAAALEBxi1JjQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAE2SURBVEiJ7dQ5SgRhEMXx34gooqhnENwQg0kNxA0x0Qt4EgU9hZkmZqJewcA1MDEzMHcHccQlEBmDqcGmwe6eUTMfFN9H8+r9q2mq+dcvaArrOMcrHuK+gYnwnOAMrY0E9+EA1ZzaC3AVs0XDx/AYTddYwkhM2Bb3ZdykYOtFwvsT4VvoyvDupQD3KOUBDhPhLQW99TrNA0yH8RLdeZMUUXrCxTjX8PQbgLQu1N5g9C/C4S0AHU3270d9q5cfADqj9zn5MP0NruLsbwJQ77nMApzEudAEYD7OoyzTjK/t7W0gvNfXVk9lGUsxQRXb8hdNeHai57DINMOoJCBZC9eD3fBWMFgEAJMJyC1WUEZ7VBmruEuEjxcNr2sIx/J/10cYaDS8rhLmsKm25R94j/umBv7///pWnxMHYbU5DLKCAAAAAElFTkSuQmCC",
				"menu": " data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAsQAAALEBxi1JjQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAH7SURBVEiJ7dU7aBVBFAbg714upBPyMqBoiEISBCFqYaugNoqFYGGnVkqUVKlETaeFnRaWvoKgQYggKIqdYKOC+EITSUwiRkgQOzE+ijkhy7q5K9fWH4bZx/+f/+zsOTNQw2lM4lfBmMdltFpCG67EuyLNJE6hVsOJMBjBdX9iBQ5iNXagghvYGsZfCzTrMRRmJkNQD8eC3IV1cd1fohnBRBVr8aqE/CLmzuDDy7/QdFZLSP+M/walqEm13FbCWxnznFSm0F6iacdcDXdwGG9i5NGCMxjH63j2HmfDbL5A04tDovxb8UBxRy6OMWzKBNgchvU099FSyYi6pA7M47PUJwu55zVssLR8WYxhYpG0iEoBsR4W8FwqlG40YwrTeWIbHqr/uePSsmRRxQA+5rhPsTOb9VXswyDeFmTaLP1Q6InMq7iGA7iHYczG+6Mx9+MiqfQulCzH/shuY9wPxP1gAbdJqszv6BPEoRKDbcHbFtnP4G4dfkckPtxIJ3djlbQsy2EWo9jeiEFzJkg9fEJLIwZTMfeU8HrxoRGDaTyTqqVpGc4W7MFt0pF5syTocUtHJuzCD6laOgqCv5N2gI6KdPoP4Rae4GdOsEbaDB/JNBCO4Lx06I9GwB7sxhfsxWPSdnFS2juKungOl6RdNY8+qZpm8E1q1HPZr/oND9aUWf6WVwEAAAAASUVORK5CYII="
			};


			this._drawingToolbar = createElement("div", "chart-drawing-toolbar", { "position": "absolute", "left": "2px", "top": "10px", "width": "40px", "backgroundColor": this.toolbar.itemBackgroundColor, "border": "1px solid " + this.toolbar.buttonBorderColor, "zIndex": 9999 });
			this._canvasJSContainer.appendChild(this._drawingToolbar);
			var menu = createElement("button", "menu", { "border": "none", "background-color": this.toolbar.itemBackgroundColor, borderWidth: this.toolbar.buttonBorderThickness, "cursor": "pointer", "outline": "none", "userSelect": "none", "MozUserSeelct": "none", "WebkitUserSelect": "none", "msUserSelect": "none" });
			menu.innerHTML = "<img src='" + this._base64Images["menu"] + "' style='width: 60%; padding: 5px'/>";


			menu.title = "Click to Show / Hide Toolbar Options";

			menu.addEventListener("mousemove", function () {
				this.style.backgroundColor = _this.toolbar.itemBackgroundColorOnHover;
			}, false);
			menu.addEventListener("mouseout", function () {
				this.style.backgroundColor = _this.toolbar.itemBackgroundColor;
			}, false);
			menu.addEventListener("click", function (e) {
				if (drawingTool.style.display === "none") {
					drawingTool.style.display = "block";
				} else {
					drawingTool.style.display = "none";
				}
			}, false);

			_this._drawingToolbar.appendChild(menu);
			drawingTool = createElement("div", "chart-drawing-toolbar-tools", { "padding": 0, "margin": 0, "textAlign": "center", "display": "none" });

			for (var i = 0; i < Object.keys(this.annotations.tools).length; i++) {
				var button = createElement("button", "chart-drawing-toolbar-button", { "display": "block", "marginLeft": "3px", "border": "none", "textAlign": "center", "backgroundColor": this.toolbar.itemBackgroundColor, "padding": 0, "margin": "0px 0px 0px 3px", "userSelect": "none", "MozUserSeelct": "none", "WebkitUserSelect": "none", "msUserSelect": "none", "outline": "none" });
				button.name = Object.keys(this.annotations.tools)[i];
				button.value = "off";
				tools.push({ button: button, name: Object.keys(_this._base64Images)[i] });


				var img = createElement('img', "", { "position": "relative", "padding": "4px", "cursor": "pointer", "background-color": this.toolbar.itemBackgroundColor, "border-width": this.toolbar.buttonBorderThickness + "px", "border-color": this.toolbar.buttonBorderColor, "border-style": "solid", "userSelect": "none", "MozUserSeelct": "none", "WebkitUserSelect": "none", "msUserSelect": "none", "outline": "none" });
				img.src = _this._base64Images[Object.keys(this.annotations.tools)[i]];
				img.title = Object.keys(this.annotations.tools)[i];
				
				button.addEventListener("mouseover", function () {
					this.childNodes[0].style.backgroundColor = _this.toolbar.itemBackgroundColorOnHover;
				}, false);
				
				button.addEventListener("mouseout", function () {
					this.childNodes[0].style.backgroundColor = this.value === "on" ? _this.toolbar.itemBackgroundColorOnHover : _this.toolbar.itemBackgroundColor;
				}, false);

				button.addEventListener("click", function () {
					if (this.name === "reset") {
						_this.clearUserCanvas();

						for (var j = 0; j < _this.drawingTools.length; j++) {
							_this.drawingTools[j].button.childNodes[0].style.backgroundColor = _this.toolbar.itemBackgroundColor;
							_this.drawingTools[j].button.value = "off";
						}
					} else {
						this.value = this.value === "on" ? "off" : "on";

						for (var j = 0; j < _this.drawingTools.length; j++) {
							if (_this.drawingTools[j].button !== this)
								_this.drawingTools[j].button.value = "off";

							_this.drawingTools[j].button.childNodes[0].style.backgroundColor = _this.toolbar.itemBackgroundColor;
						}
						this.childNodes[0].style.backgroundColor = this.value === "on" ? _this.toolbar.itemBackgroundColorOnHover : _this.toolbar.itemBackgroundColor;
					}
				}, false);
				button.appendChild(img);

				drawingTool.appendChild(button);
			}

			this._drawingToolbar.appendChild(drawingTool);


			function createElement(elementType, className, cssStyle) {
				var element;

				element = document.createElement(elementType);
				element.setAttribute("class", className);

				for (var property in cssStyle)
					element.style[property] = cssStyle[property];

				return element;
			}

			return tools;
		}
	
		var chartRender = CanvasJS.Chart.prototype.render;
		CanvasJS.Chart.prototype.render = function (options) {
			var result = chartRender.apply(this, arguments);				
			this.addAnnotations();
			return result;
		}
	}
})();