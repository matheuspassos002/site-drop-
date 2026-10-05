import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { secretKey } = await req.json();
    const adminKey = process.env.ADMIN_SECRET || process.env.ADMIN_SECRET_KEY || 'admin123';

    if (!secretKey || secretKey.trim() !== adminKey.trim()) {
      return NextResponse.json({ error: 'Chave de acesso incorreta.' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, message: 'Autenticado com sucesso' });

    // Define cookie de sessão simples para o admin
    response.cookies.set('admin_session', secretKey, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    return response;
  } catch (error) {
    console.error('Erro na rota de autenticação:', error);
    return NextResponse.json({ error: 'Erro ao validar autenticação' }, { status: 500 });
  }
}
