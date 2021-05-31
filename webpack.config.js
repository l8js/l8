import path from 'path';

export default {

    mode : "none",
    entry: {
        main: './src/l8.js'
    },
    experiments: {
        outputModule: true,
    },
    output: {
        path: path.resolve('dist'),
        filename: 'l8.bundle.js',
        library: {
            type: 'module'
        },
    }

}