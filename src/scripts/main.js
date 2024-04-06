UIBar.destroy();

$(document).one(":passageend", function() {
    setPageElement("display1","display1");
    setPageElement("nav1","nav1");
    setPageElement("display2","display2");
    setPageElement("nav2","nav2");
});