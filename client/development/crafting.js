var Status = [
    "Crafted successfully!",
    "Crafting failed!",
    "Recipe not found...",
    "Invalid Amount!"
];

mp.events.add('Crafting:Reply', (status) => {
    console.log(Status[status]);
});