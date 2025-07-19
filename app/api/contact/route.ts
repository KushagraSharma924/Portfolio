import { NextRequest, NextResponse } from 'next/server';

// Force this route to be dynamic (not statically generated)
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // For now, we'll use Resend (a modern email service)
    // You'll need to set up a Resend account and get an API key
    const resendApiKey = process.env.RESEND_API_KEY;
    const contactEmail = process.env.CONTACT_EMAIL || 'kush090605@gmail.com';
    
    if (!resendApiKey) {
      // Fallback to a simple webhook or email service
      console.log('Contact form submission:', {
        name,
        email,
        message,
        timestamp: new Date().toISOString()
      });
      
      return NextResponse.json({ 
        message: 'Message received! I\'ll get back to you soon.' 
      });
    }

    // Send email using Resend
    const emailData = {
      from: 'contact@kushagrash.me', // Using your correct domain
      to: contactEmail,
      subject: `Portfolio Contact from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>Sent from portfolio contact form at ${new Date().toLocaleString()}</small></p>
      `,
      reply_to: email,
    };

    console.log('Attempting to send email with Resend...');
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    const responseText = await response.text();
    console.log('Resend API response status:', response.status);
    console.log('Resend API response:', responseText);

    if (!response.ok) {
      console.error('Resend API error:', responseText);
      throw new Error(`Resend API error: ${response.status} - ${responseText}`);
    }

    // Try to parse the response as JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Resend response as JSON:', responseText);
      throw new Error('Invalid response from email service');
    }

    return NextResponse.json({ 
      message: 'Message sent successfully! I\'ll get back to you soon.' 
    });

  } catch (error) {
    console.error('Error handling contact form:', error);
    
    // Return a proper JSON error response
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to send message. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
