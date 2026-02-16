# Lease Buddy
Have you ever had trouble reading all that legal jargon in the dozens of pages the landlords call a lease? LeaseBuddy scans your lease, exposes junk fees and sketchy clauses, and turns legal fine print into clear, simple terms you can understand before signing.
**Link to project:** http://placecorgi.com/1200/650](https://devpost.com/software/leasebuddy)

## How It's Made:

**Tech used:** HTML, CSS, JavaScript, Python, Featherless API, React
We programmed Featherless AI to read a pdf file of a lease to output a summary of a few basic criteria that renters must know such as rent, severity of punishments, security deposit, termination clauses, security deposits and any red flags. From there, it calculates the amount of risk you will take on by signing the lease.

## Lessons Learned:
We learned how to use Featherless to read files and how to develop websites overall. This was the first time some of us implemented AI into code, and as a result, there was a learning curve we had to overcome since we initially struggled with the syntax as we learned. Additionally, we had some trouble combining the front-end and backend code for the document reader. But through some communication, we were able to successfully implement LeaseBuddy. 

## What's Next:
We hope to connect the website to legal services so that if you're about to sign a high-risk lease, or have already signed one, you can recieve advice on what to do next. In addition, we wish to add a feature where you could compare two leases to see which one is the better deal, based on risk, rent, and benefits.

## Links:

## Requirements
- Node.js 18+

## Setup Backend
```bash
cd backend
npm install
npm start


server runs on http://localhost:4000
```
## Setup Frontend
```bash
cd frontend
npm install
npm run dev


server mostly runs on http://localhost:5173



