export default [{
    input: './src/l8.js',
    output : [{
        file :'./dist/l8.runtime.esm.js',
        format: 'esm',
        sourcemap: true,
        name : "default"
    }]
}, {
    input: './src/.l8js',
    output : [{
        file :'./dist/l8.packages.esm.js',
        format: 'esm',
        sourcemap: true,
        name : "default"
    }]
}, {
    input: './src/l8.js',
    output : [{
        file :'./dist/l8.runtime.umd.js',
        format: 'umd',
        sourcemap: true,
        name : "l8"
    }]
}];