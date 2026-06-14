import Header from "@/components/medizen/Header";
import Footer from "@/components/medizen/Footer";
import PageTitle from "@/components/medizen/PageTitle";
import Link from "next/link";
import BlogSidebar from "@/components/medizen/BlogSidebar";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
  getBlogCategories,
  getRecentPublicPosts,
  getPublicBlogTags,
  getPostComments,
} from "@/app/actions/blog";
import { BlogComments } from "@/components/medizen/BlogComments";
import { BlogCoverDisplay } from "@/components/medizen/BlogCoverDisplay";
import type { Metadata } from "next";
import { OG_IMAGE } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}): Promise<Metadata> {
  const { id } = await searchParams;
  if (!id) return { title: "Blog", robots: { index: false, follow: false } };

  const post = await prisma.blogPost.findUnique({
    where: { id },
    select: { title: true, excerpt: true, coverImage: true, status: true, tags: true },
  });

  if (!post || post.status !== "Published") {
    return { title: "Article not found", robots: { index: false, follow: false } };
  }

  const description =
    post.excerpt?.trim()?.slice(0, 160) ??
    `${post.title} — health and pharmacy insights from Enviro Pharmacy, Accra.`;
  const ogImage =
    post.coverImage && /^(https?:|\/)/.test(post.coverImage) ? post.coverImage : OG_IMAGE;

  return {
    title: post.title,
    description,
    keywords: post.tags,
    alternates: { canonical: `/blog-details?id=${id}` },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: `/blog-details?id=${id}`,
      images: [{ url: ogImage, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [ogImage],
    },
  };
}

export default async function BlogDetailsPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const params = await searchParams;
  
  if (!params.id) {
    return notFound();
  }

  const post = await prisma.blogPost.findUnique({
    where: { id: params.id },
    include: { category: true }
  });

  // Only show Published posts to the public. Drafts/Archived → 404.
  if (!post || post.status !== "Published") {
    return notFound();
  }

  const [categories, recent, tags, comments] = await Promise.all([
    getBlogCategories(),
    getRecentPublicPosts(3),
    getPublicBlogTags(10),
    getPostComments(post.id),
  ]);

  // Increment views
  await prisma.blogPost.update({
    where: { id: post.id },
    data: { views: { increment: 1 } }
  });

  return (
    <>
      <Header />
      <main>
        <PageTitle title="Blog Details" />
        <section className="blog-details-section section-padding">
          <div className="container">
            <div className="row g-4">
              <div className="col-lg-8">
                <div className="blog-details-wraping blog-details-article">
                  <div className="mb-xxl-4 mb-4">
                    <h2 className="black mb-xxl-4 mb-3">{post.title}</h2>
                    <div className="admin-area blog-details-meta d-flex align-items-center gap-xl-4 gap-3 mb-xl-3 mb-2">
                      <div className="d-flex align-items-center gap-1 fs-eight pra">
                        <i className="fa-solid fa-calendar-days p2-clr"></i>
                        {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="d-flex align-items-center gap-1 fs-eight pra">
                        <i className="fa-solid fa-user p2-clr"></i>
                        By {post.authorName}
                      </div>
                      <div className="d-flex align-items-center gap-1 fs-eight pra">
                        <i className="fa-regular fa-folder-open p2-clr"></i>
                        {post.category?.name || "Health"}
                      </div>
                      <div className="d-flex align-items-center gap-1 fs-eight pra">
                        <i className="fa-solid fa-eye p2-clr"></i>
                        {post.views + 1} Views
                      </div>
                    </div>
                    {post.excerpt && (
                      <p className="pra fw-bold mb-4">{post.excerpt}</p>
                    )}
                  </div>
                  {post.coverImage && (
                    <BlogCoverDisplay
                      src={post.coverImage}
                      alt={post.title}
                      className="mb-4"
                      maxHeight={520}
                    />
                  )}
                  
                  {/* Rich Text Content */}
                  <div 
                    className="blog-content-html mb-5"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                  
                  {post.tags.length > 0 && (
                    <div className="tags-social-wrap d-flex flex-wrap justify-content-between align-items-center py-4 border-top border-bottom mb-5 gap-3">
                      <div className="d-flex align-items-center gap-3 flex-wrap">
                        <h5 className="black mb-0">Tags:</h5>
                        <ul className="list-unstyled d-flex gap-2 mb-0 flex-wrap">
                          {post.tags.map((tag) => (
                            <li key={tag}>
                              <Link
                                href={`/blog?q=${encodeURIComponent(tag)}`}
                                className="blog-tag d-inline-flex px-3 py-1 rounded-pill text-decoration-none fw_700"
                              >
                                {tag}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  <BlogComments
                    postId={post.id}
                    initialComments={comments.map((c) => ({
                      id: c.id,
                      name: c.name,
                      message: c.message,
                      createdAt: c.createdAt,
                    }))}
                  />
                </div>
              </div>
              <div className="col-lg-4">
                <BlogSidebar
                  categories={categories}
                  recent={recent}
                  tags={tags}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
