(function (window, $) {

	var Sidebar = function (target, opts) {
		this.$sidebar = $(target);
		this.$body = $(document.body);
		this.$content = this.$body.find('.jsc-sidebar-content');
		this.$trigger = this.$body.find('.jsc-sidebar-trigger');
		this.opts = opts;
		this.meta = this.$sidebar.data('sidebar-options');
	}

	Sidebar.prototype = {

		defaults: {

		},

		pushTransitionEndEvent: 'transitionEnd.push webkitTransitionEnd.push transitionend.push msTransitionEnd.push',

		pullTransitionEndEvent: 'transitionEnd.pull webkitTransitionEnd.pull transitionend.pull msTransitionEnd.pull',
		
		isAndroid: function () {
			var ua = (window.navigator.userAgent).toLowerCase(),
				isAndroid = ua.indexOf('android') > -1;

			return isAndroid;
		},

		hasTranslate3dSupport: function () {
			var p = document.createElement('p'),
				has3dSupport,
				transforms = {
					'transform': 'transform',
					'webkitTransform': '-webkit-transform',
					'MozTransform': '-moz-transform',
					'msTransform': '-ms-transform'
				};

			this.$body[0].insertBefore(p, null);

			for (var transform in transforms) {
				if (p.style[transform] !== undefined) {
					p.style[transform] = 'translate3d(1px, 1px, 1px)';
					has3dSupport = window.getComputedStyle(p).getPropertyValue(transforms[transform]);
				}
			}
			this.$body[0].removeChild(p);

			return (has3dSupport !== undefined && has3dSupport.length && has3dSupport !== 'none');
		},

		init: function () {
			this.detect3dEnabled();
			this.attachEvent();

			return this;
		},

		detect3dEnabled: function () {
			if (this.isAndroid() || !this.hasTranslate3dSupport()) {
				this.$content.removeClass('jsc-sidebar-pulled');
			}
		},

		attachEvent: function () {
			this.$trigger.on('click', $.proxy(function (e) {
				e.preventDefault();
				this.push();
			}, this));

			this.$content.on(this.pushTransitionEndEvent, $.proxy(function (e) {
				this.detectPushEnd();
			}, this));

			this.$content.on('click', $.proxy(function (e) {
				this.pull();
			}, this));
		},

		push: function () {
			if (this.isAndroid() || !this.hasTranslate3dSupport()) {
				this.slidePush();
			} else {
				this.$content.removeClass('jsc-sidebar-pull-end').addClass('jsc-sidebar-pushed');
			}
		},

		pull: function () {
			if (this.isAndroid() || !this.hasTranslate3dSupport()) {
				this.slidePull();
			} else {
				if (!this.$content.hasClass('jsc-sidebar-push-end')) {
					return;
				}

				this.$content.removeClass('jsc-sidebar-pushed');
			}
		},

		slidePull: function () {
			if (this.$content.data('sidebar-first-click') !== 1 || !this.$content.hasClass('jsc-sidebar-scroll-disabled')) {
				return;
			}

			this.$content.stop().animate({
				marginLeft: 0
			}).promise().done($.proxy(function () {
				this.$content.removeClass('jsc-sidebar-scroll-disabled');
			}, this));
		},

		slidePush: function () {
			var distance = this.isAndroid() ? '140px' : '220px';

			this.$content.stop().animate({
				marginLeft: distance
			}).promise().done($.proxy(function () {
				this.$content.addClass('jsc-sidebar-scroll-disabled');
				if (!this.$content.data('sidebar-first-click')) {
					this.$content.data('sidebar-first-click', 1);
				}
			}, this));
		},

		detectPushEnd: function () {
			this.$content.addClass('jsc-sidebar-push-end jsc-sidebar-scroll-disabled');

			this.$content.off(this.pushTransitionEndEvent);

			this.$content.on(this.pullTransitionEndEvent, $.proxy(function () {
				this.detectPullEnd();
			}, this));
		},

		detectPullEnd: function () {
			this.$content.removeClass('jsc-sidebar-push-end jsc-sidebar-scroll-disabled').addClass('jsc-sidebar-pull-end');

			this.$content.off(this.pullTransitionEndEvent);

			this.$content.on(this.pushTransitionEndEvent, $.proxy(function () {
				this.detectPushEnd();
			}, this));
		}

	};

	Sidebar.defaults = Sidebar.prototype.defaults;


	$.fn.sidebar = function (options) {
		return this.each(function () {
			new Sidebar(this, options).init();
		});
	};

	window.Sidebar = Sidebar;

})(window, jQuery);