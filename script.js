
const yearEl = document.getElementById("year");
if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}

const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
navToggle?.addEventListener("click", () => {
    navLinks?.classList.toggle("show");
});

const toast = document.getElementById("toast");
function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
}

const defaultServices = [
    { name: "Bridal Makeup", price: 18500, duration: 150 },
    { name: "HD Makeup", price: 14000, duration: 120 },
    { name: "Glassy Look Makeup", price: 11500, duration: 110 },
    { name: "Skin Finished Makeup", price: 9500, duration: 90 },
    { name: "Waterproof Makeup", price: 10500, duration: 100 }
];

const menuTable = document.getElementById("menuTable");
const menuForm = document.getElementById("menuForm");
let menuItems = [...defaultServices];

function renderMenu() {
    if (!menuTable) return;
    menuTable.innerHTML = menuItems
        .map(
            (item) => `
            <tr>
                <td>${item.name}</td>
                <td>₹${item.price.toLocaleString()}</td>
                <td>${item.duration} mins</td>
            </tr>
        `
        )
        .join("");
}

renderMenu();

menuForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(menuForm);
    const serviceName = formData.get("serviceName").trim();
    if (!serviceName) return;
    menuItems.push({
        name: serviceName,
        price: Number(formData.get("price")) || 0,
        duration: Number(formData.get("duration")) || 0
    });
    renderMenu();
    menuForm.reset();
    showToast("Service added to menu");
});

const qrWrapper = document.getElementById("qrWrapper");
const payToggleBtn = document.getElementById("payToggleBtn");
payToggleBtn?.addEventListener("click", () => {
    const visible = qrWrapper?.classList.toggle("show");
    payToggleBtn.textContent = visible ? "Hide QR" : "Show QR";
});

const bookingForm = document.getElementById("bookingForm");
const billDetails = document.getElementById("billDetails");
const totalBookingsEl = document.getElementById("totalBookings");
const topServiceEl = document.getElementById("topService");
const upcomingEventEl = document.getElementById("upcomingEvent");
const reportTable = document.getElementById("reportTable");
const printBillBtn = document.getElementById("printBillBtn");

const bookings = [];

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function calculatePrice(serviceName) {
    const service = menuItems.find((item) => item.name === serviceName);
    return service ? service.price : 0;
}

function updateBillPreview(booking) {
    if (!billDetails) return;
    if (!booking) {
        billDetails.innerHTML = "<p>No bookings yet.</p>";
        return;
    }
    billDetails.innerHTML = `
        <p><strong>Client:</strong> ${booking.name}</p>
        <p><strong>Service:</strong> ${booking.service}</p>
        <p><strong>Date:</strong> ${formatDate(booking.date)}</p>
        <p><strong>Amount:</strong> ₹${booking.price.toLocaleString()}</p>
        <p><strong>Notes:</strong> ${booking.notes || "–"}</p>
    `;
}

function updateSummary() {
    totalBookingsEl && (totalBookingsEl.textContent = bookings.length.toString());

    if (!bookings.length) {
        topServiceEl && (topServiceEl.textContent = "–");
        upcomingEventEl && (upcomingEventEl.textContent = "–");
        reportTable && (reportTable.innerHTML = '<tr><td colspan="3">No data yet.</td></tr>');
        updateBillPreview();
        return;
    }

    const serviceCounts = bookings.reduce((acc, current) => {
        acc[current.service] = (acc[current.service] || 0) + 1;
        return acc;
    }, {});
    const [topService] = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1]);
    if (topService && topServiceEl) {
        topServiceEl.textContent = topService[0];
    }

    const upcoming = [...bookings]
        .filter((item) => new Date(item.date) >= new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
    if (upcomingEventEl) {
        upcomingEventEl.textContent = upcoming ? formatDate(upcoming.date) : "–";
    }

    const monthMap = new Map();
    bookings.forEach((booking) => {
        const date = new Date(booking.date);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        if (!monthMap.has(key)) {
            monthMap.set(key, { count: 0, services: {} });
        }
        const entry = monthMap.get(key);
        entry.count += 1;
        entry.services[booking.service] = (entry.services[booking.service] || 0) + 1;
    });

    const rows = [...monthMap.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => {
            const [year, month] = key.split("-").map(Number);
            const monthName = new Date(year, month).toLocaleString("en", { month: "long", year: "numeric" });
            const [trend] = Object.entries(value.services).sort((a, b) => b[1] - a[1]);
            return `
                <tr>
                    <td>${monthName}</td>
                    <td>${value.count}</td>
                    <td>${trend ? trend[0] : "–"}</td>
                </tr>
            `;
        })
        .join("");

    if (reportTable) {
        reportTable.innerHTML = rows;
    }

    updateBillPreview(bookings[bookings.length - 1]);
}

bookingForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(bookingForm);
    const booking = {
        name: formData.get("name").trim(),
        phone: formData.get("phone").trim(),
        service: formData.get("service"),
        date: formData.get("date"),
        notes: formData.get("notes"),
        price: calculatePrice(formData.get("service"))
    };
    bookings.push(booking);
    bookingForm.reset();
    updateSummary();
    showToast("Booking saved");
});

printBillBtn?.addEventListener("click", () => {
    if (!bookings.length) {
        showToast("Add a booking first");
        return;
    }
    const billWindow = window.open("", "PRINT", "height=600,width=400");
    if (!billWindow) return;
    billWindow.document.write(`
        <html>
            <head>
                <title>Serene Glow Bill</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h2 { margin-top: 0; }
                </style>
            </head>
            <body>
                <h2>Serene Glow Beauty Parlour</h2>
                ${billDetails?.innerHTML || ""}
            </body>
        </html>
    `);
    billWindow.document.close();
    billWindow.focus();
    billWindow.print();
});

const contactForm = document.querySelector(".contact-form");
contactForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    contactForm.reset();
    showToast("Message sent! We\'ll respond shortly.");
});

updateSummary();
