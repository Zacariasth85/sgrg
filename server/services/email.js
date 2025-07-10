const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else if (process.env.SENDGRID_API_KEY) {
      // SendGrid configuration
      this.transporter = nodemailer.createTransporter({
        service: 'SendGrid',
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY
        }
      });
    } else {
      console.warn('Email service not configured. Email notifications will be disabled.');
    }
  }

  async sendEmail(to, subject, html, text = null) {
    if (!this.transporter) {
      console.warn('Email service not configured. Cannot send email.');
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@sgrg.com',
        to,
        subject,
        html,
        text: text || this.stripHtml(html)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
  }

  async sendWelcomeEmail(user) {
    const subject = 'Bem-vindo ao SGRG!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e293b;">Bem-vindo ao SGRG!</h1>
        <p>Olá ${user.username},</p>
        <p>Obrigado por se juntar ao SGRG - Sistema de Gerenciamento de Repositórios no GitHub!</p>
        <p>Agora você pode:</p>
        <ul>
          <li>Gerenciar todos os seus repositórios em um só lugar</li>
          <li>Visualizar estatísticas detalhadas</li>
          <li>Acompanhar atividades em tempo real</li>
          <li>Colaborar com outros desenvolvedores</li>
        </ul>
        <p>Comece explorando seu dashboard e descobrindo todas as funcionalidades disponíveis.</p>
        <p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
             style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Acessar SGRG
          </a>
        </p>
        <p>Atenciosamente,<br>Equipe SGRG</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 12px; color: #6b7280;">
          Desenvolvido por Zacarias Thequimo
        </p>
      </div>
    `;

    return await this.sendEmail(user.email, subject, html);
  }

  async sendRepositoryNotification(user, action, repositoryName) {
    const subject = `SGRG: ${action} - ${repositoryName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e293b;">Notificação de Repositório</h1>
        <p>Olá ${user.username},</p>
        <p>Uma ação foi realizada em seu repositório:</p>
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <strong>Ação:</strong> ${action}<br>
          <strong>Repositório:</strong> ${repositoryName}<br>
          <strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}
        </div>
        <p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/repositories" 
             style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Ver Repositórios
          </a>
        </p>
        <p>Atenciosamente,<br>Equipe SGRG</p>
      </div>
    `;

    return await this.sendEmail(user.email, subject, html);
  }

  async sendActivitySummary(user, activities) {
    const subject = 'SGRG: Resumo de Atividades';
    const activitiesList = activities.map(activity => 
      `<li>${activity.action.replace('_', ' ')} - ${activity.details} (${new Date(activity.timestamp).toLocaleString('pt-BR')})</li>`
    ).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e293b;">Resumo de Atividades</h1>
        <p>Olá ${user.username},</p>
        <p>Aqui está um resumo das suas atividades recentes no SGRG:</p>
        <ul style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
          ${activitiesList}
        </ul>
        <p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/activities" 
             style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Ver Todas as Atividades
          </a>
        </p>
        <p>Atenciosamente,<br>Equipe SGRG</p>
      </div>
    `;

    return await this.sendEmail(user.email, subject, html);
  }
}

module.exports = EmailService;

