module.exports = function (grunt) {

  var jsDependenciesFiles = [
    'bower_components/d3/d3.js'
  ];

  var cssFiles = [
    'src/*/*.css'
  ];

  var jsFiles = [
    'src/*.js',
    'src/*/*.js'
  ];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      all: ['Gruntfile.js', 'src/**/*.js']
    },
    concat: {
      basic: {
        src: jsDependenciesFiles.concat(jsFiles),
        dest: 'dist/thisplay.js'
      }
    },
    uglify: {
      options: {
        banner: '/* <%= grunt.template.today("yyyy-mm-dd") %> */ ',
        mangle: false,
        preserveComments: false
      },
      build: {
        src: 'dist/thisplay.js',
        dest: 'dist/thisplay.min.js'
      }
    },
    cssmin: {
      target: {
        files: {
          'dist/thisplay.min.css':
          cssFiles
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  
  grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'cssmin']); 
  grunt.registerTask('js', ['jshint', 'concat', 'uglify']);
};