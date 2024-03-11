let data;
let map;

window.onload = () =>
{
    fetch("./countries.json")
        .then((response) => response.json())
        .then((json) =>
        {
            data = json;
            for (let i = 0; i < data.countries.length; i++)
            {
                let country = document.getElementById(data.countries[i].alpha);

                country.classList.add("chosen");
                country.onmouseenter = () => { showDetails(data.countries[i].alpha); };
                country.onmouseleave = () => { toggleDetails("none"); };

                document.body.onmousemove = function (e)
                {
                    let menu = document.getElementById("info-panel");

                    if (e.clientX / window.innerWidth <= 0.5)
                    {
                        menu.style.left = e.clientX + "px";
                    }
                    else
                    {
                        menu.style.left = (e.clientX - menu.offsetWidth) + "px";
                    }

                    if (e.clientY / window.innerHeight <= 0.5)
                    {
                        menu.style.top = e.clientY + "px";
                    }
                    else
                    {
                        menu.style.top = (e.clientY - menu.offsetHeight) + "px";
                    }
                }
            }

            changeMap("hdi");
            changeLegend();
        });
}

function changeLegend()
{
    let max = data.max[map];

    for (let i = 0; i < 4; i++)
    {
        let text = document.getElementById("text-" + i);
        let percent = Math.round(max * (1 - i * 0.25) * 100) / 100;

        if (map == "lei")
        {
            text.innerHTML = percent + " year(s)";
        }
        else if (map == "ei")
        {
            text.innerHTML = percent;
        }
        else if (map == "ii")
        {
            text.innerHTML = "$" + percent.toLocaleString("en-US") + ".00";
        }
        else if (map == "hdi")
        {
            text.innerHTML = percent;
        }
    }
}

function changeMap(id)
{
    map = id;
    changeLegend();

    for (let i = 0; i < data.countries.length; i++)
    {
        let country = data.countries[i];

        let percent = 0;
        if (map == "lei")
        {
            percent = getLEI(country.leb);
        }
        else if (map == "ei")
        {
            percent = getEI(country.eys, country.mys);
        }
        else if (map == "ii")
        {
            percent = getII(country.gni);
        }
        else if (map == "hdi")
        {
            percent = getHDI(getLEI(country.leb), getEI(country.eys, country.mys), getII(country.gni));
        }

        let color = interpolate("#FFFFFF", "#0000FF", percent);
        document.getElementById(country.alpha).style.fill = color;
    }
}

function showDetails(country)
{
    let index = data.countries.findIndex(obj => obj.alpha == country);
    let countryData = data.countries[index];

    let name = countryData.name;
    document.getElementById("name").innerHTML = name;

    let lei = getLEI(countryData.leb);
    let ei = getEI(countryData.eys, countryData.mys);
    let ii = getII(countryData.gni);

    document.getElementById("hdi").innerHTML = "Human Development Index (HDI): " + getHDI(lei, ei, ii);

    document.getElementById("lei").innerHTML = "Life Expectancy Index (LEI): " + lei;
    document.getElementById("lei-ind").innerHTML = "Life Expectancy at Birth (LEB): " + countryData.leb + " year(s)";

    document.getElementById("ei").innerHTML = "Education Index (EI): " + ei;
    document.getElementById("ei-ind1").innerHTML = "Expected Years of Schooling (EYS): " + countryData.eys + " year(s)";
    document.getElementById("ei-ind2").innerHTML = "Mean Years of Schooling (MYS): " + countryData.mys + " year(s)";

    document.getElementById("ii").innerHTML = "Income Index (II): " + ii;
    document.getElementById("ii-ind").innerHTML = "GNIpc (Gross National Income per capita): $" + countryData.gni.toLocaleString("en-US") + ".00";

    toggleDetails("block");
}

function toggleDetails(str)
{
    document.getElementById("info-panel").style.display = str;

    document.getElementById(map).style.display = str;
    if (map == "ei")
    {
        document.getElementById(map + "-ind1").style.display = str;
        document.getElementById(map + "-ind2").style.display = str;
    }
    else
    {
        document.getElementById(map + "-ind").style.display = str;
    }
}

function interpolate(color1, color2, percent)
{
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);

    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);

    const r = Math.round(r1 + (r2 - r1) * percent);
    const g = Math.round(g1 + (g2 - g1) * percent);
    const b = Math.round(b1 + (b2 - b1) * percent);

    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function getLEI(leb) { return Math.round((leb - 20) / 65 * 100) / 100 }
function getEI(eys, mys) { return Math.round(((eys / 18) + (mys / 15)) / 2 * 100) / 100 }
function getII(gni) { return Math.round((Math.log(gni) - Math.log(100)) / Math.log(750) * 100) / 100 }
function getHDI(lei, ei, ii) { return Math.round(Math.cbrt(lei * ei * ii) * 100) / 100 }