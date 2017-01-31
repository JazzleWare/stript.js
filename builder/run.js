'use strict';

var fs = require( 'fs' );
var dist = './out/stript';
var src = './src';

function Builder() {
  this.moduleNames = {};
  this.moduleList = [];
  this.strExports = "";  
  this.strTest = "";
  this.str = "";
  this.test = "";
}

Builder.prototype.addModule = function(name, path) {
  var entry = this.moduleNames[name];
  if ( entry ) entry.path = path;
  else {
     this.moduleNames[name] = entry = { path: path, submodules: [], name: name };
     this.moduleList.push(entry);
  }
};

Builder.prototype.subModuleFor = function(name, path) {
   if ( !this.moduleNames[name] )
         this.addModule(name, null);

   this.moduleNames[name].submodules.push(path);
};

Builder.prototype.setExports = function(strExports) {
   this.strExports = strExports;
};

Builder.prototype.build = function() {
   this.  write_string(  '(function(){\n"use strict";\n' );
   
   var e = 0;
   while ( e < this.moduleList.length )
      this.writeModule(  this.moduleList[e++ ] );

   this. write_string( ';\n (function(){\n' +
                       '       var i = 0;\n' +
                       '       while(i < this.length){\n' +
                       '          var def = this[i++];\n' +
                       '          if ( !def ) continue;\n' +
                       '          var e = 0;\n' +
                       '          while ( e < def[1].length )\n' +
                       '             def[1][e++].call(def[0]);\n' +
                       '       }\n' +
                       '     }).call([\n' );
   var e = 0;
   while ( e < this.moduleList.length ) {
      if ( e ) this.write_string( ',\n' );
      this.writeSubmodules( this.moduleList[e++ ] );
   }

   var str = this.str;
   this.writeFinish(this.strExports);
   var main = this.str;
  
   this.str = str;
   this.writeFinish(this.strExports+'\n;(function(){'+this.strTest+'})();');
   var test = this.str;

   this.test = test;
   this.str = main;
};  

Builder.prototype.writeFinish = function(finishCode) {
   this. write_string(  ']);\n' + finishCode + ';}).call (function(){try{return module.exports;}catch(e){return this;}}.call(this))' );
};
  
Builder.prototype.write = function(output, str) {
   console.log("WRITING MODULES");
   fs .writeSync(output, str, 0, str.length);
   fs .closeSync(output);

   console.log("FINISHED ALL.");
};

Builder.prototype.writeFileString = function(str) {
  this.write_string(str);
};

Builder.prototype.writeModule = function(  module ) {
   console.log( "--WRITING MODULE", module.name );
   this. write_string(  ';\n');
   this. writeFileString(  fs .readFileSync( module.path ) );
   console.log( "--FINISHED MODULE" );
};          
  
Builder.prototype.writeSubmodules = function(module) {
   if ( module.submodules.length === 0 ) {
     console.log( "----(NO SUBMODULES FOR ", module.name + " )\n" ) ;
     this.write_string( 'null' );
     return;

   }

   console.log( "----", module.name + " SUBMODULES" );

   this. write_string(  '[' );
   this. write_string( (module.name) + '.prototype, [' ); 

   var e = 0;

   while ( e < module.submodules.length ) {
     console.log( "----WRITING SUBMODULE", module.submodules[e] );
     if ( e ) this. write_string( ',\n' );
     this.write_string( 'function(){\n' );
     this.writeFileString( fs .readFileSync(module.submodules[e] ) );
     this.write_string( '\n}')   ;
 
     console.log( "----FINISHED", module.submodules[e] );
     e++;
   }

   this.write_string( ']  ]' );

   console.log( "----(FINISHED SUBMODULES)\n" );
};   

Builder.prototype.write_string = function ( str) {
  this.str += str;

};

var builder = new Builder();
var files = fs .readdirSync(src);

var e = 0;
while ( e < files.length ) {
  if ( fs .statSync(src+'/'+files[e]).isFile() ) {
    var name = files[e];
    name = name.substring(0, name.indexOf('.js') );
    if ( name.charAt(0) === '@' )
      builder.addModule(name.substring(1),src + '/' + files[e]);

    else if ( name === 'mexport' )
      builder.setExports(fs. readFileSync(src + '/' + files[e]) );

    else if (name === 'test')
      builder.strTest = fs.readFileSync(src+'/'+files[e]);

    else {
        var l = name.indexOf('@');
        if ( l >= 0 ) 
          builder.subModuleFor (name.substring( l +  1 ), src + '/' + files[e] );
        
        else
           builder.addModule(name, src + '/' + files[e] ) ;
    }
  }
  
  e ++ ;
}

var exports = {};

console.log("BUILD STARTED");
builder.build();

builder.write(fs.openSync(dist+'.js', 'w+'), builder.str);
builder.write(fs.openSync(dist+'_test.js', 'w+'), builder.test);

console.log("BUILD STAGE COMPLETE.");

console.log("TESTING");

try { eval(builder.test); }
catch (e) { console.log("TESTING FAILED", e.message); throw e; }

console.log("TEST STAGE COMPLETE.");
