module.exports = function procs(procdata){

    var processes = {};

    procdata.toString().split(/\n/).forEach(function(line){
        if(!line || line[0] === '#') return;

        var tuple = /^([A-Za-z0-9_-]+):\s*(.+)$/m.exec(line);

        var prockey = tuple[1].trim();
        var command = tuple[2].trim();

        if(!prockey)
            throw new SyntaxError('Syntax Error in Procfile, Line %d: No Prockey Found',i+1);

        if(!command)
            throw new SyntaxError('Syntax Error in Procfile, Line %d: No Command Found',i+1);

        processes[prockey]=command;
    });

    return processes;
}
