import mailer from "nodemailer";
import hbs from 'nodemailer-express-handlebars';
import path from 'path';

function formatBodyText(text:string) {
    const formattedText = text.replace(/\. /g, '.<br><br/>');
    return `<p>${formattedText}</p>`;
}

const transporter = mailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    },
});

transporter.use('compile', hbs({
    viewEngine: {
        extname: '.hbs',
        layoutsDir: path.resolve(__dirname, '../views/email/'),
    },
    viewPath: path.join(__dirname, 'views/email/'),
    extName: '.hbs',
}));

export const sendMail = (to:string, subject:string, html:string) => {
    let mailOptions = {
        to: to,
        subject: subject,
        from: {
            name: "WFF",
            address: `noreply@${process.env.EMAIL}`,
        },
        text: "WFF",
        template: 'template',
        context: {
            title: subject,
            body: formatBodyText(html),
            footer: 'Copyright @2024 WFF, All right Reserved'
        },
    };

    transporter.sendMail(mailOptions, function (err, result) {
        if (err) console.log(err);
        console.log(result);
    });
};

export const sendMultipleMail = (to:string[], subject:string, html:string) => {
    let mailOptions = {
        bcc: to.join(','),
        subject: subject,
        from: {
            name: "WFF",
            address: `noreply@${process.env.EMAIL}`,
        },
        text: "WFF",
        template: 'template',
        context: {
            title: subject,
            body: formatBodyText(html),
            footer: 'Copyright @2024 WFF, All right Reserved'
        },
    };

    transporter.sendMail(mailOptions, function (err, result) {
        if (err) console.log(err);
        console.log(result);
    });
};
