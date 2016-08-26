var fs 				  = require('fs');
var cls 			  = require('cli-color');
var prompt   		  = require('co-prompt');
var co 	     		  = require('co');
var serialise 		  = require('object-tojson');
var stringifyObject	  = require('stringify-object');
var fs 				  = require("fs");



module.exports = function (cmd) {

		var self = this;

		self.repository = [];
		self.softwares  = [];
		self.json  	 	= [];
		self.path 		= "";
		self.repo_source = '/etc/apt/source-list.test';
		
		this.store = function () {
				
				if ( self.path == '' ) {

					console.log(cls.red('You need to specify a directory, where a json file will be generated!'));
					process.exit();
				}
				self.get_repository_list();

		}.bind(self);
	
		   /*
			*	Getting all source list from /etc/apt/source
		   */
		  
		this.get_repository_list = function() {
				
				console.log(cls.green('Collecting repository list....'));

				cmd.get("grep -r --include '*.list' '^deb ' /etc/apt/sources.list*",function(data) {

							var data = data.split('\n');
							var temp = '';

							for ( i = 0; i < data.length - 1; i++ ){
								//console.log(data[i].match("(:d+)(.+)$"));

								if (data[i] != undefined) {

									temp = data[i].match("(:d+)(.+)$")[0].substring(5);
									self.repository.push('deb '+temp);
									self.repository.push('deb-src '+temp);

								}
 
							}

							console.log(cls.green('Repository list Fetched!'));
							self.get_software_list();
    			});

		}.bind(self);
		
	   /*
		*	Get installed software list from ubuntu machine 
	   */
	  
		this.get_software_list = function () {
				
				console.log(green('Collecting installed software list from ubuntu machine......'));
    			
    			cmd.get("dpkg --get-selections | grep -v deinstall",function(data){

    						var data = data.split("\n");
    						
    						for (i = 0; i < data.length; i++) {
    							self.softwares.push('sudo apt-get install '+data[i].replace('install','').replace(/\s/g, '')+' -y');
    						}

					 console.log(cls.green('Software list Fetched!'));
					 self.pack_json();

	    		});

		}.bind(self);

		/*
		 *	Packing all repository list and apt-get commands into a json file
		*/
		this.pack_json = function () {
				
			console.log(green('packing json files....'));

				var obj = {

						"repository" : self.repository,
						"softwares": self.softwares
				};
				
				var json = JSON.stringify(obj);

					fs.writeFile((self.path+'package-installer.json'), json , { flag: 'w' }, function (err) {
					    
					    if (err) {
					    	console.log(cls.red(err));
					    	process.exit();
					    }
						console.log(cls.green('Json is packed into a file!'));
						process.exit();

					});


		}.bind(self);

		// install everything in the json file
		
		this.run = function () {

			if (self.path == '') {

				console.log(cls.red('You have to specify full directory name with a filename'));
				process.exit();
			}



			if ( self.path.slice(-4) !== 'json' && self.path.slice(-4) !== 'JSON') {

					console.log(cls.red('Filename must be in a json format.'));
					process.exit();
			}


			fs.readFile(self.path, 'utf8', function (err, data) {

			    if (err) console.log(cls.red(err)); // we'll not consider error handling for now
			    
			    var obj = JSON.parse(data);

			    self.softwares = obj.softwares;
			    self.repository = obj.repository;
			    self.installer();

			});
 
		//	var obj = JSON.parse(fs.parse(fs.readFileSync(path,'utf8')));
		
		}.bind(self);


		this.installer = function () {

			console.log(cls.green('Starting installation....'));

			if ( (self.repository.length == 0) && (self.softwares.length == 0) ) {

				console.log(cls.red('There is no repository and softwares in the package'));
				process.exit();
			}
			console.log(cls.green('Writing on source list .....'));

			fs.readFile(self.repo_source, 'utf8', function (err, data) {

			    if (err) 
			    	console.log(cls.red(err)); // we'll not consider error handling for now
			    
			    var new_data = data;

			    for (i = 0; i < self.repository; i ++) {

			    		data += self.repository[i]+'\n';
			    }

			    	fs.writeFile(self.repo_source, data , { flag:'w' } , function(err){

			    		if (err) {
			    			
			    			console.log(cls.red(err));
			    		
			    			} else {

			    			console.log(cls.green('Repository list is now updated in your ubuntu machine!'));
			    		}

			    	});

			});


			console.log(cls.green('Ready to start apt-get installations'));
			
			for (i = 0 ; i < self.softwares.length; i++) {

					cmd.run(self.softwares[i]);
			}

			if ( i == self.softwares.length) {

				console.log(cls.green('installation complete!'));
				process.exit();
			}

		}.bind(self);


		this.get = function(cmd) {

		
			co(function *() {

			    	switch(cmd) {

			    		case 'store':
			    			self.path = yield prompt('path: ');
			    			self.store();
			    			break;
			    		case 'run':
			    			self.path = yield prompt('path: ');
			    			self.run();
			    			break;
			    		default:
			    			
			    		break;
			    	}

		     })
 
		 }.bind(self);

}

