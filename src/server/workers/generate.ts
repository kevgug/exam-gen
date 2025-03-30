if (!process.send) {
    console.error("error: no IPC. were we forked?");
    process.exit(1);
}

// process exam

const schemes = [];

setTimeout(() => {
    process.send?.("hello!");
}, 2000);