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

export const dynamic = "force-dynamic";

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
                <div className="blog-details-wraping">
                  <div className="mb-xxl-4 mb-4">
                    <h2 className="black mb-xxl-4 mb-3">{post.title}</h2>
                    <div className="admin-area d-flex align-items-center gap-xl-4 gap-3 mb-xl-3 mb-2">
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
                    <div className="thumb w-100 rounded-4 mb-4">
                      <img src={post.coverImage} alt="Cover" className="w-100 rounded-4" />
                    </div>
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
                                className="d-inline-flex px-3 py-1 rounded-pill text-decoration-none fw_700"
                                style={{
                                  background: "rgba(0,0,0,0.04)",
                                  color: "#09162a",
                                  fontSize: "0.76rem",
                                }}
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
