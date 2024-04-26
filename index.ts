


document.addEventListener('DOMContentLoaded', (event) => {
    let today = new Date().toISOString().split('T')[0];
    document.getElementsByName("date")[0].setAttribute('max', today);
});
window.onload = () => {
    let storedEntries = JSON.parse(localStorage.getItem('weightEntries') || '[]');
    weightEntries = storedEntries.map((entry: any) => ({...entry, date: new Date(entry.date)}));
    displayWeightEntries();
    updateCurrentWeight();
    allTimeChart(); 
};


type WeightEntry = {date:Date, weight:number};
let weightEntries:WeightEntry[] = [];
let chart:Chart;

//weight entries

function addWeightEntry(event:Event):void{
    event.preventDefault();

    let dateInput = <HTMLInputElement>document.getElementById("date");
    let weightInput = <HTMLInputElement>document.getElementById("weight");

    let date = new Date();
    if (dateInput.valueAsDate) {
        date.setFullYear(dateInput.valueAsDate.getFullYear(), dateInput.valueAsDate.getMonth(), dateInput.valueAsDate.getDate());
    }

    let weight = Number(weightInput.value);

    weightEntries.push({date, weight});

    localStorage.setItem('weightEntries', JSON.stringify(weightEntries));

    displayWeightEntries();
    updateCurrentWeight();

}

function displayWeightEntries(): void {
    let tableBody = <HTMLElement>document.querySelector(".weight-list tbody");

    
    tableBody.innerHTML = '';

    let storedEntries = JSON.parse(localStorage.getItem('weightEntries') || '[]');
    weightEntries = storedEntries.map((entry: any) => ({...entry, date: new Date(entry.date)}));

    let start= Math.max(0, weightEntries.length - 10);

    for (let i=start;i<weightEntries.length;i++) {
        let entry = weightEntries[i];
        let row = document.createElement("tr");

        let weightCell = document.createElement("td");
        weightCell.className="weight-list__weight";
        weightCell.textContent = entry.weight.toString()+" kg";
        row.appendChild(weightCell);

        let dateCell = document.createElement("td");
        dateCell.className="weight-list__date";
        let today = new Date();
        let diffInDays = Math.floor((today.getTime() - entry.date.getTime()) / (1000 * 60 * 60 * 24));

        
        let time = entry.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        if (diffInDays === 0) {
            dateCell.textContent = `today at ${time}`;
        } else if (diffInDays === 1) {
            dateCell.textContent = `yesterday at ${time}`;
        } else if (entry.date.getFullYear() === today.getFullYear()) {
            dateCell.textContent = `${entry.date.getDate()} ${entry.date.toLocaleString('default', { month: 'short' })} at ${time}`;
        } else {
            dateCell.textContent = `${entry.date.getDate()} ${entry.date.toLocaleString('default', { month: 'short' })} ${entry.date.getFullYear()} at ${time}`;
        }

       
        row.appendChild(dateCell);

        tableBody.insertBefore(row, tableBody.firstChild);
    }
}

function updateCurrentWeight(){
    let sortedEntries=weightEntries.sort((a,b)=>a.date.valueOf()-b.date.valueOf());
    let currentWeight=sortedEntries[sortedEntries.length-1].weight;
    
    let currentWeightElement = <HTMLElement>document.querySelector(".weight-statistics__stats-current-weight");
    currentWeightElement.textContent = currentWeight.toString() + " kg";
}


//chart

function createChart(period:string){
    console.log(period);
    let labels:string[] = [];
    let data:number[] = [];
    let today = new Date();

    
    let sortedEntries=weightEntries.sort((a,b)=>a.date.valueOf()-b.date.valueOf());

    let filteredEntries: typeof sortedEntries = [];

    switch (period) {
        case 'weekly':
            filteredEntries = sortedEntries
                .filter(entry => (today.valueOf() - entry.date.valueOf()) <= 7 * 24 * 60 * 60 * 1000);
            break;
        case 'monthly':
            filteredEntries = sortedEntries
                .filter(entry => (today.valueOf() - entry.date.valueOf()) <= 30 * 24 * 60 * 60 * 1000);
            break;
        case 'yearly':
            filteredEntries = sortedEntries
                .filter(entry => (today.valueOf() - entry.date.valueOf()) <= 365 * 24 * 60 * 60 * 1000);
            break;
        case 'all-time':
            filteredEntries = sortedEntries;
            break;
    }

    labels = filteredEntries.map(entry => entry.date.getDate() + ' ' + entry.date.toLocaleString('default', { month: 'short' }));
    data = filteredEntries.map(entry => entry.weight);

    const chartElement= document.getElementById('lineChart') as HTMLCanvasElement;
    if(chart){
        chart.destroy();
    }

    

    chart = new Chart(chartElement, {
        type: 'line',
        data:{
            labels:labels,
            datasets:[{
                label: 'Weight',
                data:data,
                fill: false,
                borderColor: '#a09ac2'
            }]
        },
        options:{
            plugins: {
                legend: {
                  display: false
                }
              }
            
        }
    });

    let startWeightElement = <HTMLElement>document.querySelector(".weight-statistics__stats-start-weight");
    startWeightElement.textContent = data[0].toString() + " kg";
    let progressWeightElement = <HTMLElement>document.querySelector(".weight-statistics__stats-progress-weight");
    let progress = data[data.length - 1] - data[0];
    progressWeightElement.textContent = progress.toString() + " kg";
}



function weeklyChart(){
    createChart('weekly');
}

function monthlyChart(){
    createChart('monthly');
}
function yearlyChart(){
    createChart('yearly');
}
function allTimeChart(){
    createChart('all-time');
}

