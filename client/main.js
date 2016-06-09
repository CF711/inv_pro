import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { HTTP } from 'meteor/http';
import { Pages } from '../import/pages.js';

import './main.html';

Router.route('/', function () {
	this.render('home', {data: {title: "Home"}});
});

Router.route('/login', function () {
	this.render('registration', {title: "Login"})
});

Router.route('/pages', function (pages) {
	this.render('pages', {pages:pages});
});

Router.route('/fblogin', function () {
	this.render('fblogin');
});

Router.route('/post/:id', function () {
	this.render('post');
});

Template.signup.events({
	'submit form': function(event) {
		event.preventDefault();
		var username = $('[name="username"]').val();
		var password = $('[name="password"]').val();
		Accounts.createUser({
			username: username,
			password: password
		});
		Router.go('/fblogin');
	}
});

Template.login.events({
	'submit form': function(event) {
		event.preventDefault();
		var username = $('[name="username"]').val();
		var password = $('[name="password"]').val();
		Accounts.login({
			username: username,
			password: password
		});
		Router.go('/fblogin');
	}
});

Template.pages.helpers({
	getPages: function() {
		return Pages.find().fetch();
	}
});

Template.pages.events({
	'click #test': function(event) {
		var url = "https://graph.facebook.com/" + Meteor.user().services.facebook.id + "/accounts?fields=&access_token=" + Meteor.user().services.facebook.accessToken;
		HTTP.call("GET", url, function(err, result) {
			if (!err) {
				for (var index in result.data.data) {
					var page = result.data.data[index];
					var insertPage = {
						name: page.name,
						id: page.id,
						accessToken: page.access_token
					};
					Pages.insert(insertPage);
				}
			}
		})
	},

	'click .page-link': function(event) {
		console.log(event.target.id);
		var page = Pages.findOne({"id":event.target.id});
		var id = event.target.id;
		console.log(page);
		Session.set('id', page.id);
		Session.set('name', page.name);
		Session.set('access', page.accessToken);

		var url = '/post/' + page.id;
		Router.go(url);
	}

});

Template.fblogin.events({
	'click #facebook-login': function(event) {
		Meteor.loginWithFacebook({
			requestPermissions: ['publish_pages', 'manage_pages']
		}, function(err) {
			if (err) {
				throw new Meteor.Error("Facebook login failed");
			} else {
				var url = "https://graph.facebook.com/" + Meteor.user().services.facebook.id + "/accounts?fields=&access_token=" + Meteor.user().services.facebook.accessToken;
				HTTP.call("GET", url, function(err, result) {
					if (!err) {
						var pages = result.data.data;
						for (var page in pages) {
							var insPage = {
								name: pages[page].name,
								id: pages[page].id,
								accessToken: pages[page].access_token
							};
							Pages.insert(insPage);

							console.log(Pages.find().fetch());
						}
						Router.go('/pages');
					}
				})
			}
		});
	}
});

Template.nav.events({
	'click #logout': function(event) {
		Meteor.logout(function(err) {
			if (err) {
				throw new Meteor.Error("Logout failed");
			}
		});
	}
});

Template.post.helpers({
	showBanner: function() {
		document.getElement
	},
	hideBanner: function() {

	},
	clearTextBox: function() {

	}
});

Template.post.events({
	'click #post-status': function(event, template) {

		var accessToken = Session.get('access');
		var pageId = Session.get('id');
		var message = $('[name="status-box"]').val();

		var url =  "https://graph.facebook.com/" + pageId + "/feed?message=" + message + "&access_token=" + accessToken;
		HTTP.call("POST", url, function (err, result) {
			if (!err) {

			} else {
				console.log(err);
			}
		})
	}
});

Pages.allow({
	insert: function(page) {
		return true;
	}
});